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

        # Debugging output
        # print(f"\nProcessing Flight {flight_id} (Capacity: {capacity}, Target Bookings: ~{target_booked_seats} seats)")

        while seats_booked_on_this_flight < target_booked_seats and seats_available_for_this_flight:
            # 1. Create Customer - Loop to handle potential duplicate emails
            customer_id = None
            max_customer_retries = 5 # Limit attempts to find a unique email
            for attempt in range(max_customer_retries):
                customer_name = fake.name()
                # Generate email - Faker's unique might still collide if script runs multiple times
                # or across different processes if not managed carefully.
                customer_email = fake.email()
                customer_phone = fake.phone_number()

                try:
                    # Attempt to insert the customer WITHOUT ON CONFLICT
                    cursor.execute("""
                        INSERT INTO customer (name, email, phone)
                        VALUES (%s, %s, %s)
                        RETURNING customer_id;
                    """, (customer_name, customer_email, customer_phone))
                    customer_id = cursor.fetchone()[0]
                    # If insert succeeds, break the customer creation loop
                    break

                except psycopg2.errors.UniqueViolation as uv_error:
                    conn.rollback() # Rollback the failed insert attempt
                    print(f"Attempt {attempt + 1}/{max_customer_retries}: Duplicate email generated ({customer_email}). Retrying...")
                    # If it was the last attempt, log failure and break loop
                    if attempt == max_customer_retries - 1:
                        print(f"Failed to generate a unique email after {max_customer_retries} attempts. Skipping booking.")
                        break # Break inner loop, customer_id remains None
                    # Continue loop to generate new email and try again
                    continue

                except psycopg2.Error as db_err: # Catch other specific database errors
                    conn.rollback() # Rollback this booking attempt
                    print(f"Database error creating customer ({customer_email}): {db_err}. Skipping booking.")
                    customer_id = None # Ensure customer_id is None
                    break # Break inner loop, skip booking

                except Exception as e:
                    conn.rollback() # Rollback this booking attempt
                    print(f"Unexpected error creating customer ({customer_email}): {e}. Skipping booking.")
                    customer_id = None # Ensure customer_id is None
                    break # Break inner loop, skip booking

            # Check if customer creation succeeded after retries
            if not customer_id:
                 # If customer_id is still None after the loop, skip to the next booking attempt
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
                email = None
                phone = None

                if i == 0: # First passenger is the customer
                    name_parts = customer_name.split(" ", 1)
                    first_name = name_parts[0]
                    last_name = name_parts[1] if len(name_parts) > 1 else "Customer" # Handle single names
                    email = customer_email
                    phone = customer_phone
                else: # Additional passengers
                    p_name = fake.name()
                    name_parts = p_name.split(" ", 1)
                    first_name = name_parts[0]
                    last_name = name_parts[1] if len(name_parts) > 1 else "Passenger"
                    # Optionally add fake email/phone for others
                    # email = fake.email()
                    # phone = fake.phone_number()

                try:
                    cursor.execute("""
                        INSERT INTO passenger (booking_id, first_name, last_name, email, phone)
                        VALUES (%s, %s, %s, %s, %s) RETURNING passenger_id;
                    """, (booking_id, first_name, last_name, email, phone))
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

        # debugging output

        # print(f"Finished Flight {flight_id}. Seats Booked: {seats_booked_on_this_flight}/{capacity}")
        # Commit after each flight to avoid one large transaction
        conn.commit()

    print(f"\n--- Seeding Summary ---")
    print(f"Flights Processed: {flight_count}/{len(flights_to_seed)}")
    print(f"Total Bookings Created: {total_bookings_created}")
    print(f"Total Passengers Created: {total_passengers_created}")
    print(f"Total Seats Booked: {total_seats_booked}")
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