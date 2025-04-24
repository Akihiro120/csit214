import psycopg2
from faker import Faker
import random
import sys
import os
import time as _time
from datetime import datetime

# --- Database Connection ---
db_host = os.environ.get("POSTGRES_HOST", "localhost")
db_port = os.environ.get("POSTGRES_PORT", 5432)
db_name = os.environ.get("POSTGRES_DB")
db_user = os.environ.get("POSTGRES_USER")
db_password = os.environ.get("POSTGRES_PASSWORD")


conn = None
cursor = None
retries = 5
wait_time = 3

while retries > 0:
    try:
        print(f"Attempting to connect to database: host={db_host}, port={db_port}, dbname={db_name}...")
        conn = psycopg2.connect(
            dbname=db_name,
            user=db_user,
            password=db_password,
            host=db_host,
            port=db_port
        )
        cursor = conn.cursor()
        print("Database connection successful!")
        break
    except psycopg2.OperationalError as e:
        print(f"Database connection failed: {e}")
        retries -= 1
        if retries == 0:
            print("Max connection retries reached. Exiting.")
            sys.exit(1)
        print(f"Retrying in {wait_time} seconds...")
        _time.sleep(wait_time)
    except Exception as e:
        print(f"An unexpected error occurred during connection: {e}")
        sys.exit(1)

if not conn or not cursor:
    print("Failed to establish database connection and cursor. Exiting.")
    sys.exit(1)

# --- Seeding Logic ---
try:
    fake = Faker()
    print("Starting booking data seeding...")

    # Check if bookings already exist
    cursor.execute("SELECT 1 FROM bookings LIMIT 1")
    if cursor.fetchone():
        print("Bookings table is not empty. Assuming seeding already done. Exiting.")
        conn.rollback() # Rollback any potential transaction start
        sys.exit(0)

    # Get all flight IDs and their initial available seats (total capacity)
    cursor.execute("SELECT flight_id, available_seats FROM flights WHERE flight_date >= %s", (datetime.now().date(),))
    flights_to_seed = cursor.fetchall()
    print(f"Found {len(flights_to_seed)} upcoming flights to seed.")

    # Get all seat numbers
    cursor.execute("SELECT seat_number FROM seat")
    all_seat_numbers = [row[0] for row in cursor.fetchall()]
    total_seats_available_per_flight = len(all_seat_numbers)
    print(f"Total seat numbers available per flight: {total_seats_available_per_flight}")

    if not all_seat_numbers:
        print("Error: No seats found in the seat table. Cannot proceed.")
        sys.exit(1)

    # --- Customer Reuse Logic Setup ---
    email_conflict_count = 0 # Initialize conflict counter
    INITIAL_CONFLICT_THRESHOLD = 20 # Start considering reuse after this many conflicts
    REUSE_PROBABILITY = 0.80 # Always have an 80% chance to reuse after threshold is met
    REUSE_SAMPLE_SIZE = 100 # Fetch this many candidates from DB when reusing
    # --------------------------

    flight_count = 0
    total_bookings_created = 0
    total_passengers_created = 0
    total_seats_booked = 0

    for flight_id, initial_available_seats in flights_to_seed:
        flight_count += 1
        if initial_available_seats != total_seats_available_per_flight:
             print(f"Warning: Flight {flight_id} initial available seats ({initial_available_seats}) doesn't match total seats ({total_seats_available_per_flight}). Using initial_available_seats.")
             capacity = initial_available_seats
        else:
             capacity = total_seats_available_per_flight

        if capacity <= 0:
            print(f"Skipping flight {flight_id} due to zero or negative capacity ({capacity}).")
            continue

        target_occupancy_percentage = random.uniform(0.20, 0.95)
        target_booked_seats = int(capacity * target_occupancy_percentage)
        seats_available_for_this_flight = list(all_seat_numbers) # Copy the list for this flight
        random.shuffle(seats_available_for_this_flight) # Shuffle for random seat assignment
        seats_booked_on_this_flight = 0

        while seats_booked_on_this_flight < target_booked_seats and seats_available_for_this_flight:

            # --- Determine if reusing customer ---
            should_reuse = False
            # Check if reuse is even possible and if threshold met
            if email_conflict_count >= INITIAL_CONFLICT_THRESHOLD:
                 # Check if there are any customers in the DB to reuse first
                 cursor.execute("SELECT 1 FROM customer LIMIT 1")
                 can_reuse = cursor.fetchone() is not None
                 if can_reuse:
                     if random.random() < REUSE_PROBABILITY:
                         should_reuse = True

            customer_id = None
            customer_name = None
            customer_email = None
            customer_phone = None
            selected_customer_details = None # To store the chosen customer from the sample

            # --- Attempt to reuse customer if applicable ---
            if should_reuse:
                try:
                    # Fetch a larger sample of random customers using TABLESAMPLE
                    # Use a smaller percentage (e.g., 1%) but larger LIMIT
                    cursor.execute(f"SELECT customer_id, name, email, phone FROM customer TABLESAMPLE SYSTEM (1) LIMIT {REUSE_SAMPLE_SIZE}")
                    potential_customers = cursor.fetchall()

                    if potential_customers:
                        # Randomly choose one customer from the fetched sample
                        selected_customer_details = random.choice(potential_customers)
                        customer_id, customer_name, customer_email, customer_phone = selected_customer_details
                        # print(f"Reusing customer {customer_id} ({customer_email})") # Optional debug log
                    else:
                        # TABLESAMPLE might return 0 rows even if table isn't empty
                        print(f"Warning: TABLESAMPLE(1) LIMIT {REUSE_SAMPLE_SIZE} didn't return any customers. Falling back to creation.")
                        should_reuse = False # Force fallback
                except Exception as e:
                    print(f"Error fetching random customer sample: {e}. Falling back to creation.")
                    customer_id = None # Ensure fallback
                    should_reuse = False # Force fallback

            # --- Create new customer if not reused ---
            if not should_reuse:
                max_customer_retries = 8 # Limit attempts to find a unique email
                for attempt in range(max_customer_retries):
                    temp_customer_name = fake.name()
                    temp_customer_email = fake.email()
                    temp_customer_phone = fake.phone_number()

                    try:
                        # Attempt to insert the customer
                        cursor.execute("""
                            INSERT INTO customer (name, email, phone)
                            VALUES (%s, %s, %s)
                            RETURNING customer_id;
                        """, (temp_customer_name, temp_customer_email, temp_customer_phone))
                        customer_id = cursor.fetchone()[0]
                        # Assign details for passenger creation later
                        customer_name = temp_customer_name
                        customer_email = temp_customer_email
                        customer_phone = temp_customer_phone
                        # print(f"Created new customer {customer_id} ({customer_email})") # Optional debug log
                        # If insert succeeds, break the customer creation loop
                        break

                    except psycopg2.errors.UniqueViolation as uv_error:
                        conn.rollback() # Rollback the failed insert attempt
                        email_conflict_count += 1 # Increment conflict counter
                        print(f"Attempt {attempt + 1}/{max_customer_retries}: Duplicate email ({temp_customer_email}). Conflicts: {email_conflict_count}. Retrying...")
                        # If it was the last attempt, log failure and break loop
                        if attempt == max_customer_retries - 1:
                            print(f"Failed to generate a unique email after {max_customer_retries} attempts. Skipping booking.")
                            break # Break inner loop, customer_id remains None
                        # Continue loop to generate new email and try again
                        continue

                    except psycopg2.Error as db_err: # Catch other specific database errors
                        conn.rollback() # Rollback this booking attempt
                        print(f"Database error creating customer ({temp_customer_email}): {db_err}. Skipping booking.")
                        customer_id = None # Ensure customer_id is None
                        break # Break inner loop, skip booking

                    except Exception as e:
                        conn.rollback() # Rollback this booking attempt
                        print(f"Unexpected error creating customer ({temp_customer_email}): {e}. Skipping booking.")
                        customer_id = None # Ensure customer_id is None
                        break # Break inner loop, skip booking

            # Check if customer creation/reuse succeeded
            if not customer_id:
                 # If customer_id is still None after the loop, skip to the next booking attempt
                 print("Skipping booking due to customer creation/reuse failure.")
                 continue

            # 2. Create Booking
            booking_id = None
            try:
                cursor.execute("""
                    INSERT INTO bookings (customer_id) VALUES (%s) RETURNING booking_id;
                """, (customer_id,))
                booking_id = cursor.fetchone()[0]
                total_bookings_created += 1
            except Exception as e:
                print(f"Error creating booking for customer {customer_id}: {e}")
                conn.rollback()
                continue

            # 3. Create Passengers (1 to 4 per booking)
            num_passengers = random.randint(1, 4)
            passengers_in_booking = []

            # Ensure we don't book more seats than available or targeted
            if seats_booked_on_this_flight + num_passengers > target_booked_seats or len(seats_available_for_this_flight) < num_passengers :
                 num_passengers = min(target_booked_seats - seats_booked_on_this_flight, len(seats_available_for_this_flight))
                 if num_passengers <= 0:
                      # Not enough seats left for even one passenger, rollback booking
                      print(f"Not enough seats left for booking {booking_id}. Rolling back booking.")
                      cursor.execute("DELETE FROM bookings WHERE booking_id = %s", (booking_id,))
                      total_bookings_created -= 1
                      continue # Try next booking


            for i in range(num_passengers):
                passenger_id = None
                first_name = ""
                last_name = ""
                p_email = None # Use different variable name
                p_phone = None

                if i == 0: # First passenger is the customer (new or reused)
                    # Use the customer_name, customer_email, customer_phone obtained earlier
                    name_parts = customer_name.split(" ", 1)
                    first_name = name_parts[0]
                    last_name = name_parts[1] if len(name_parts) > 1 else "Customer" # Handle single names
                    p_email = customer_email
                    p_phone = customer_phone
                else: # Additional passengers
                    p_name = fake.name()
                    name_parts = p_name.split(" ", 1)
                    first_name = name_parts[0]
                    last_name = name_parts[1] if len(name_parts) > 1 else "Passenger"
                    # Optionally add fake email/phone for others
                    # p_email = fake.email()
                    # p_phone = fake.phone_number()

                try:
                    cursor.execute("""
                        INSERT INTO passenger (booking_id, first_name, last_name, email, phone)
                        VALUES (%s, %s, %s, %s, %s) RETURNING passenger_id;
                    """, (booking_id, first_name, last_name, p_email, p_phone))
                    passenger_id = cursor.fetchone()[0]
                    passengers_in_booking.append(passenger_id)
                    total_passengers_created += 1
                except Exception as e:
                    print(f"Error creating passenger for booking {booking_id}: {e}")
                    # If passenger creation fails, we might have an orphaned booking.
                    # For simplicity here, we'll let it be, but in production, you'd handle this.
                    conn.rollback() # Rollback this booking attempt
                    passengers_in_booking = [] # Clear passengers for this failed booking
                    break # Stop adding passengers for this booking

            if not passengers_in_booking: # If passenger creation failed
                 continue # Skip to next booking attempt

            # 4. Assign Seats (one per passenger in the booking)
            seats_assigned_this_booking = 0
            for passenger_id in passengers_in_booking:
                if not seats_available_for_this_flight:
                    print(f"Warning: Ran out of seats for flight {flight_id} while processing booking {booking_id}. Some passengers may not have seats.")
                    break # Stop assigning seats for this booking

                seat_to_assign = seats_available_for_this_flight.pop() # Get a random available seat

                try:
                    cursor.execute("""
                        INSERT INTO flight_seats (flight_id, seat_number, booking_id, passenger_id)
                        VALUES (%s, %s, %s, %s);
                    """, (flight_id, seat_to_assign, booking_id, passenger_id))
                    seats_booked_on_this_flight += 1
                    seats_assigned_this_booking += 1
                    total_seats_booked += 1
                except Exception as e:
                    print(f"Error assigning seat {seat_to_assign} for flight {flight_id}, booking {booking_id}: {e}")
                    # Put seat back if assignment failed? For simplicity, we don't here.
                    conn.rollback() # Rollback this booking attempt
                    # Need to decide how to handle partial seat assignment failure within a booking
                    break # Stop assigning seats for this booking

        # Commit after each flight to avoid one large transaction
        conn.commit()

    print(f"\n--- Seeding Summary ---")
    print(f"Flights Processed: {flight_count}/{len(flights_to_seed)}")
    print(f"Total Bookings Created: {total_bookings_created}")
    print(f"Total Passengers Created: {total_passengers_created}")
    print(f"Total Seats Booked: {total_seats_booked}")
    print(f"Total Email Conflicts Encountered: {email_conflict_count}") # Added conflict count summary
    print("Booking data seeding completed successfully.")

except Exception as e:
    print(f"An error occurred during booking seeding: {e}")
    if conn:
        conn.rollback()
    sys.exit(1)

finally:
    if cursor:
        cursor.close()
    if conn:
        conn.close()
    print("Database connection closed.")