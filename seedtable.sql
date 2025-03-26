-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Airports (formerly Destination)
CREATE TABLE airport (
    airport_code VARCHAR(3) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    city VARCHAR(100),
    country VARCHAR(100),
    local_timezone VARCHAR(50)
);

-- Routes
CREATE TABLE route (
    route_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    origin_airport_code VARCHAR(3) REFERENCES airport(airport_code),
    destination_airport_code VARCHAR(3) REFERENCES airport(airport_code)
);

-- Flights
CREATE TABLE flights (
    flight_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    flight_number VARCHAR(10) NOT NULL,
    route_id UUID REFERENCES route(route_id),
    flight_date DATE NOT NULL,
    departure_time TIME NOT NULL,
    arrival_time TIME NOT NULL,
    UNIQUE (flight_number, flight_date)
);

-- Customers
CREATE TABLE customer (
    customer_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(30)
);

-- Bookings
CREATE TABLE bookings (
    booking_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID REFERENCES customer(customer_id),
    flight_id UUID REFERENCES flights(flight_id),
    booking_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'Confirmed'
);

-- Passengers
CREATE TABLE passenger (
    passenger_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID REFERENCES bookings(booking_id),
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    date_of_birth DATE
);

-- Seats
CREATE TABLE seat (
    seat_number VARCHAR(5) PRIMARY KEY,
    class VARCHAR(20) NOT NULL
);

-- Flight Seats (junction table)
CREATE TABLE flight_seats (
    flight_seat_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    flight_id UUID REFERENCES flights(flight_id),
    seat_number VARCHAR(5) REFERENCES seat(seat_number),
    availability BOOLEAN DEFAULT TRUE,
    passenger_id UUID REFERENCES passenger(passenger_id) -- optional, assigned when booked
);

-- Inflight Services
CREATE TABLE inflight_services (
    service_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID REFERENCES bookings(booking_id),
    passenger_id UUID REFERENCES passenger(passenger_id), -- optional, if specific passenger
    service_type VARCHAR(20),
    description VARCHAR(100)
);

create index ROUTEDATE_IDX on flights(route_id, flight_date)
