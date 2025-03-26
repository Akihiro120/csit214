# requires psycopg2

# to install use:
# python3 -m venv venv
# source venv/bin/activate
# pip3 install psycopg2-binary

import psycopg2
import random
from datetime import timedelta, datetime

# Connect to PostgreSQL
conn = psycopg2.connect(
    dbname="flight_app",
    user="postgres",
    password="1234",
    host="localhost",
    port="5432"
)
cursor = conn.cursor()

# Seed Airports
airport_codes = ['SYD', 'MEL', 'BNE', 'PER', 'ADL']
airport_cities = {"SYD": "Sydney", "MEL": "Melbourne", "BNE": "Brisbane", "PER": "Perth", "ADL": "Adelaide"}
airports = []
for code in airport_codes:
    airports.append((code, airport_cities.get(code) + " Airport", airport_cities.get(code), "Australia", "Australia/" + airport_cities.get(code)))
cursor.executemany("""
    INSERT INTO airport (airport_code, name, city, country, local_timezone)
    VALUES (%s, %s, %s, %s, %s)
""", airports)

# Seed Routes with a random flight_time between 1 and 5 hours
routes = []
for i in range(0, len(airport_codes)):
    for j in range(0, len(airport_codes)):
        if i != j:
            flight_duration = timedelta(hours=random.randint(1, 5))
            routes.append((airport_codes[i], airport_codes[j], flight_duration))
cursor.executemany("""
    INSERT INTO route (origin_airport_code, destination_airport_code, flight_time)
    VALUES ( %s, %s, %s)
""", routes)

# Build a mapping of route_id to (origin, destination)
cursor.execute("SELECT route_id, origin_airport_code, destination_airport_code FROM route")
route_info = {r[0]: (r[1], r[2]) for r in cursor.fetchall()}

# Seed Flights
cursor.execute("SELECT route_id FROM route")
route_ids = [r[0] for r in cursor.fetchall()]
flights = []

today = datetime.now().date()
end_date = datetime(today.year, 12, 31).date()

# Base departure hours for the 5 daily flights
base_hours = [6, 10, 14, 18, 22]

# Build a mapping of (route_id, base_hour) to a unique flight number
flight_numbers = {}
unique_counter = 100
for route_id in route_ids:
    for base_hour in base_hours:
        flight_numbers[(route_id, base_hour)] = f"FDR{unique_counter}"
        unique_counter += 1

current_date = today
while current_date <= end_date:
    for route_id in route_ids:
        for base_hour in base_hours:
            base_dep = datetime.combine(current_date, datetime.min.time()).replace(hour=base_hour)
            # Add a random offset of ±15 minutes so departures are not exactly on the hour
            offset = timedelta(minutes=random.randint(-15, 15))
            dep_time_dt = base_dep + offset
            dep_time = dep_time_dt.time()
            flight_number = flight_numbers[(route_id, base_hour)]
            flights.append((flight_number, route_id, current_date, dep_time))
    current_date += timedelta(days=1)

cursor.executemany("""
    INSERT INTO flights (flight_number, route_id, flight_date, departure_time)
    VALUES (%s, %s, %s, %s)
""", flights)

# Seed Seats
classes = ['Economy', 'Business']
seats = []
for row in range(1, 6):
    for seat in 'ABCDEF':
        seats.append((f"{row}{seat}", "Business"))
for row in range(6, 31):
    for seat in 'ABCDEF':
        seats.append((f"{row}{seat}", "Economy"))
cursor.executemany("""
    INSERT INTO seat (seat_number, class)
    VALUES (%s, %s)
""", seats)

# Commit transactions
conn.commit()

# Close the connection
cursor.close()
conn.close()