import psycopg2
from datetime import datetime, timedelta, time
import random
import sys
import os
import time as _time # Use a different name for the imported time module to avoid conflict

db_host = os.environ.get("POSTGRES_HOST", "localhost")
db_port = os.environ.get("POSTGRES_PORT", 5432)
db_name = os.environ.get("POSTGRES_DB")
db_user = os.environ.get("POSTGRES_USER")
db_password = os.environ.get("POSTGRES_PASSWORD")


conn = None
cursor = None # Initialize cursor to None
retries = 5
wait_time = 3 # seconds

# --- Database Connection with Retry ---
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
        cursor = conn.cursor() # Create cursor after successful connection
        print("Database connection successful!")
        break # Exit loop on success
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

# Check if connection and cursor were successfully created before proceeding
if not conn or not cursor:
    print("Failed to establish database connection and cursor. Exiting.")
    sys.exit(1)

# --- Start of your data seeding logic ---
try: # Wrap the rest of the script in a try block for proper cleanup
    cursor.execute("SELECT airport_code FROM airport")
    airport_codes = [row[0] for row in cursor.fetchall()]

    # Explicitly define high-demand and lower-demand routes
    high_demand_routes = [
        ('SYD', 'MEL'), ('MEL', 'SYD'), ('SYD', 'BNE'), ('BNE', 'SYD')
    ]


    # Generate regular routes by pairing all airport codes
    regular_routes = []
    for i in range(len(airport_codes)):
        for j in range(len(airport_codes)):
            if i == j:
                continue
            route = (airport_codes[i], airport_codes[j])
            # Avoid adding high-demand routes again
            if route not in high_demand_routes:
                regular_routes.append(route)


    
    # Create a list of tuples for seat numbers and classes
    # Assuming the first 2 rows are First Class, next 3 rows are Business Class, and the rest are Economy
    seat_rows = range(1, 30) #29 rows
    first_class_seat_letters = ['A', 'B', 'E', 'F']
    seat_letters = ['A', 'B', 'C', 'D', 'E', 'F']
    seats = []
    # Define seats for different classes
    first_class_seat_letters = ['A', 'B', 'E', 'F']  # First class has 4 seats per row (no middle seats)
    business_economy_seat_letters = ['A', 'B', 'C', 'D', 'E', 'F']  # Business and Economy have 6 seats per row
    
    for row in seat_rows:
        # For first class rows, only use first_class_seat_letters
        if row <= 2:
            for letter in first_class_seat_letters:
                seat_num = f"{row}{letter}"
                seat_class = 'First'
                seats.append((seat_num, seat_class))
        # For business class rows
        elif row <= 5:
            for letter in business_economy_seat_letters:
                seat_num = f"{row}{letter}"
                seat_class = 'Business'
                seats.append((seat_num, seat_class))
        # For economy rows
        else:
            for letter in business_economy_seat_letters:
                seat_num = f"{row}{letter}"
                seat_class = 'Economy'
                seats.append((seat_num, seat_class))
    
    cursor.executemany("""
        INSERT INTO seat (seat_number, class)
        VALUES (%s, %s)
    """, seats)


    # Create a list of tuples for route_ids
    routes = high_demand_routes + regular_routes
    route_details = {} # Store route_id and fixed flight numbers per (origin, destination) tuple
    flight_number_counter = 100 # Start assigning flight numbers from FD100

    for origin, destination in routes:
        dummy_flight_time = timedelta(hours=random.randint(1, 15), minutes=random.choice([0, 15, 30, 45]))
        dummy_distance = random.randint(300, 8000)
        dummy_base_fare = round(random.uniform(100.00, 1500.00), 2)

        cursor.execute("""
            INSERT INTO route (origin_airport_code, destination_airport_code, flight_time, distance, base_fare)
            VALUES (%s, %s, %s, %s, %s)
            RETURNING route_id
        """, (origin, destination, dummy_flight_time, dummy_distance, dummy_base_fare))
        route_id = cursor.fetchone()[0]

        # --- Assign Fixed Flight Numbers per Route Slot ---
        route_key = (origin, destination)
        if route_key in high_demand_routes:
            flights_per_day = 4
        else:
            flights_per_day = 2

        # Assign a sequence of flight numbers for this route's daily slots
        assigned_nums_for_route_slots = []
        for _ in range(flights_per_day):
            assigned_nums_for_route_slots.append(f"FD{flight_number_counter}")
            flight_number_counter += 1 # Increment for the next slot/route

        route_details[route_key] = {'id': route_id, 'flight_numbers_by_slot': assigned_nums_for_route_slots}


    # Generate flights based on realistic frequencies
    start_date = datetime.now().date()
    for route_key, details in route_details.items():
        route_id = details['id']
        # These are the fixed numbers for the slots (e.g., ['FD100', 'FD101', 'FD102', 'FD103'])
        fixed_flight_nums_for_slots = details['flight_numbers_by_slot']
        flights_per_day = len(fixed_flight_nums_for_slots)

        for day_offset in range(30):  # Generate flights for one month
            flight_date = start_date + timedelta(days=day_offset)

            # Generate distinct departure times for the day
            departure_times = set()
            while len(departure_times) < flights_per_day:
                 dep_hour = random.randint(6, 22)
                 dep_minute = random.choice([0, 11, 15, 22, 28, 34, 39, 43, 49, 51, 55])
                 departure_times.add(time(dep_hour, dep_minute))

            # Sort the times to determine the order (1st flight, 2nd flight, etc.)
            departure_times_list = sorted(list(departure_times))

            # Assign the fixed flight number for each slot to the corresponding departure time
            for i in range(flights_per_day):
                # Get the flight number assigned to this slot (e.g., 0=1st flight, 1=2nd flight)
                flight_num = fixed_flight_nums_for_slots[i]
                # Get the departure time for this slot (earliest, second earliest, etc.)
                dep_time = departure_times_list[i]
                dummy_available_seats = 166 # Assuming an empty flight for simplicity

                cursor.execute("""
                    INSERT INTO flights (flight_number, route_id, flight_date, departure_time, available_seats)
                    VALUES (%s, %s, %s, %s, %s)
                    ON CONFLICT (flight_number, flight_date) DO NOTHING
                """, (flight_num, route_id, flight_date, dep_time, dummy_available_seats))

    conn.commit() # Commit the changes
    print("Data seeding completed successfully.")


except Exception as e:
    print(f"An error occurred during seeding: {e}")
    if conn:
        conn.rollback() # Rollback changes on error
    sys.exit(1)

finally: # Ensure cursor and connection are closed
    if cursor:
        cursor.close()
    if conn:
        conn.close()
    print("Database connection closed.")

