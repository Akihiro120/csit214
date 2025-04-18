import psycopg2
from datetime import datetime, timedelta, time
import random
import sys
import os
import time # Added missing import for time.sleep

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
        time.sleep(wait_time)
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

    regular_routes = []
    for i in range(len(airport_codes)):
        for j in range(len(airport_codes)):
            if i == j:
                continue
            route = (airport_codes[i], airport_codes[j])
            # Avoid adding high-demand routes again
            if route not in high_demand_routes:
                regular_routes.append(route)


    seat_rows = range(1, 30) #29 rows
    first_class_seat_letters = ['A', 'B', 'E', 'F']
    seat_letters = ['A', 'B', 'C', 'D', 'E', 'F']
    seats = []

    for row in seat_rows:
        for letter in seat_letters:
            seat_num = f"{row}{letter}"
            # Assign first class seats to the first two rows
            if letter in first_class_seat_letters and row <= 2:
                seat_class = 'First'
            else:
                # Assign business class to the next two rows
                if letter in first_class_seat_letters and row > 2:
                    seat_class = 'Business'
                else:
                    # Economy class for all other seats
                    seat_class = 'Economy'
            seats.append((seat_num, seat_class))




    cursor.executemany("""
        INSERT INTO seat (seat_number, class)
        VALUES (%s, %s)
    """, seats)


    # Add routes
    routes = high_demand_routes + regular_routes
    route_ids = []
    for origin, destination in routes:
        cursor.execute("""
            INSERT INTO route (route_id, route_name)
            VALUES (uuid_generate_v4(), %s)
            RETURNING route_id
        """, (f"{origin} to {destination}",))
        route_id = cursor.fetchone()[0]
        route_ids.append((route_id, origin, destination))

    # Add route segments (one segment per route, as direct flights only currently)
    for route_id, origin, destination in route_ids:
        cursor.execute("""
            INSERT INTO route_segment (segment_id, route_id, segment_order, departure_airport_code, arrival_airport_code, flight_duration)
            VALUES (uuid_generate_v4(), %s, 1, %s, %s, %s)
        """, (route_id, origin, destination, timedelta(hours=random.randint(1, 5))))

    # Generate flights based on realistic frequencies
    start_date = datetime.now().date()
    for route_id, origin, destination in route_ids:
        cursor.execute("SELECT segment_id FROM route_segment WHERE route_id = %s", (route_id,))
        segment_id = cursor.fetchone()[0]

        for day_offset in range(30):  # Generate flights for one month
            flight_date = start_date + timedelta(days=day_offset)
            # High frequency routes have more flights per day
            if (origin, destination) in high_demand_routes:
                flights_per_day = 4
            else:
                flights_per_day = 2

            for _ in range(flights_per_day):
                dep_hour = random.randint(6, 22)
                dep_minute = random.choice([0, 11, 15, 22, 28, 34, 39, 43, 49, 51, 55])
                dep_time = time(dep_hour, dep_minute)
                flight_duration_hours = random.randint(1, 5)
                arr_time = (datetime.combine(flight_date, dep_time) + timedelta(hours=flight_duration_hours)).time()

                cursor.execute("""
                    INSERT INTO flights (flight_id, flight_number, segment_id, flight_date, departure_time, arrival_time)
                    VALUES (uuid_generate_v4(), %s, %s, %s, %s, %s)
                """, (f"FD{random.randint(100,999)}", segment_id, flight_date, dep_time, arr_time))

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

