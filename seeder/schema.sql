
\echo '>>> Running schema.sql...'
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Airports
CREATE TABLE airport (
    airport_code VARCHAR(3) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    city VARCHAR(100),
    country VARCHAR(100),
    local_timezone VARCHAR(50)
);

-- Routes (now includes flight_time)
CREATE TABLE route (
    route_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    origin_airport_code VARCHAR(3) REFERENCES airport(airport_code),
    destination_airport_code VARCHAR(3) REFERENCES airport(airport_code),
    flight_time INTERVAL NOT NULL,
    distance INT NOT NULL,
    base_fare DECIMAL(10, 2) NOT NULL
);

-- Flights (arrival_time removed; calculate it when needed using departure_time and flight_time)
CREATE TABLE flights (
    flight_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    flight_number VARCHAR(10) NOT NULL,
    route_id UUID REFERENCES route(route_id),
    flight_date DATE NOT NULL,
    departure_time TIME NOT NULL,
    available_seats INT NOT NULL,
    UNIQUE (flight_number, flight_date)
);

-- Customers
CREATE TABLE customer (
    customer_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(30)
);

-- Bookings (no longer store flight_seat_id here)
CREATE TABLE bookings (
    booking_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID REFERENCES customer(customer_id),
    booking_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    booking_hash TEXT GENERATED ALWAYS AS (md5(booking_id::text)) STORED,
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

-- Flight Seats: now references booking_id directly, removing the cycle.
CREATE TABLE flight_seats (
    flight_seat_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    flight_id UUID REFERENCES flights(flight_id),
    seat_number VARCHAR(5) REFERENCES seat(seat_number),
    booking_id UUID REFERENCES bookings(booking_id),  -- indicates seat is booked
    passenger_id UUID REFERENCES passenger(passenger_id), -- optional assignment
    UNIQUE (flight_id, seat_number) -- Ensures each seat on a specific flight is unique
);

-- Inflight Services
CREATE TABLE inflight_services (
    service_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID REFERENCES bookings(booking_id),
    passenger_id UUID REFERENCES passenger(passenger_id), -- optional, if specific passenger
    service_type VARCHAR(20),
    description VARCHAR(100)
);

-- Index
CREATE INDEX ROUTEDATE_IDX ON flights(route_id, flight_date);
CREATE INDEX SEATS_IDX ON flight_seats(flight_id);
CREATE INDEX BOOKING_IDX ON flight_seats(booking_id);



INSERT INTO airport (airport_code, name, city, country, local_timezone) VALUES
('SYD', 'Sydney Airport', 'Sydney', 'Australia', 'Australia/Sydney'),
('MEL', 'Melbourne Tullamarine Airport', 'Melbourne', 'Australia', 'Australia/Melbourne'),
('ADL', 'Adelaide Airport', 'Adelaide', 'Australia', 'Australia/Adelaide'),
('DRW', 'Darwin Airport', 'Darwin', 'Australia', 'Australia/Darwin'),
('HBA', 'Hobart Airport', 'Hobart', 'Australia', 'Australia/Hobart'),
('PER', 'Perth Airport', 'Perth', 'Australia', 'Australia/Perth'),
('BNE', 'Brisbane Airport', 'Brisbane', 'Australia', 'Australia/Brisbane'),
('WOL', 'Shellharbour Airport', 'Albion Park Rail', 'Australia', 'Australia/Sydney');


