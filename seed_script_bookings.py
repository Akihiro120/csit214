from faker import Faker
import random
from datetime import date
fake = Faker()

# Load customers
cursor.execute("SELECT customer_id FROM customer")
customer_ids = [row[0] for row in cursor.fetchall()]

# Get all flights
cursor.execute("SELECT flight_id FROM flights")
flights = [row[0] for row in cursor.fetchall()]

for flight_id in flights:
    # Get available seats
    cursor.execute("""
        SELECT flight_seat_id, seat_number
        FROM flight_seats
        WHERE flight_id = %s AND availability = TRUE
    """, (flight_id,))
    available_seats = cursor.fetchall()

    random.shuffle(available_seats)

    # Fill 60% of seats
    seats_to_fill = int(len(available_seats) * 0.6)
    seat_index = 0

    while seat_index < seats_to_fill:
        group_size = random.randint(1, 4)
        if seat_index + group_size > seats_to_fill:
            group_size = seats_to_fill - seat_index

        if group_size == 0:
            break

        customer_id = random.choice(customer_ids)

        # Insert booking
        cursor.execute("""
            INSERT INTO bookings (booking_id, customer_id, flight_id, status)
            VALUES (uuid_generate_v4(), %s, %s, 'Confirmed')
            RETURNING booking_id
        """, (customer_id, flight_id))
        booking_id = cursor.fetchone()[0]

        for _ in range(group_size):
            first_name = fake.first_name()
            last_name = fake.last_name()
            dob = fake.date_of_birth(minimum_age=18, maximum_age=90)

            # Insert passenger
            cursor.execute("""
                INSERT INTO passenger (passenger_id, booking_id, first_name, last_name, date_of_birth)
                VALUES (uuid_generate_v4(), %s, %s, %s, %s)
                RETURNING passenger_id
            """, (booking_id, first_name, last_name, dob))
            passenger_id = cursor.fetchone()[0]

            # Assign seat
            flight_seat_id, seat_number = available_seats[seat_index]
            seat_index += 1

            cursor.execute("""
                UPDATE flight_seats
                SET availability = FALSE, passenger_id = %s
                WHERE flight_seat_id = %s
            """, (passenger_id, flight_seat_id))
        # Commit the transaction
        conn.commit()
# Close the cursor and connection
cursor.close()
conn.close()