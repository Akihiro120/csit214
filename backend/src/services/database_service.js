// a little thing we have for base seats,
// make query fast, maybe
const seats_status = require('../seats')

// this is a database service, it is a global class instance, or a singleton
const Knex = require('knex');
class DatabaseService {
    constructor() {
        
        // connect to the database
        try {
            // attempt connection
            this.database = new Knex({
                client: 'pg',
                connection: {
                    host: process.env.POSTGRES_HOST || 'localhost',
                    port: process.env.POSTGRES_PORT,
                    user: process.env.POSTGRES_USER,
                    password: process.env.POSTGRES_PASSWORD,
                    database: process.env.POSTGRES_DB,
                    ssl: false,
                }
            });

            console.log("Database Connection Successful");
        } catch (connection_fail) {

            // failed connection, throw error
            throw new Error(`Failed to initialize connection to database: ${connection_fail}`);
        }
    }

    // QUERIES ::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
    // TODO: Abstract this into another class if things get too big

    // query flights
    async query_flights(from, to, date) {
        try {
            // query flight data
            const flight_data = await this.database.raw(`
                SELECT 
                    f.flight_id,
                    o_airport.name AS dept_city,
                    d_airport.name AS arr_city,
                    r.base_fare,
                    r.distance AS distance,
                    f.departure_time AS dept_time,
                    (r.flight_time + f.departure_time) AS arr_time,
                    COUNT(flight_seats.seat_number) AS booked_seats
                FROM flights f
                INNER JOIN route r ON r.route_id = f.route_id
                INNER JOIN airport o_airport ON r.origin_airport_code = o_airport.airport_code
                INNER JOIN airport d_airport ON r.destination_airport_code = d_airport.airport_code
                LEFT JOIN flight_seats ON flight_seats.flight_id = f.flight_id
                WHERE r.origin_airport_code = '${from}'
                AND r.destination_airport_code = '${to}'
                AND f.flight_date = '${date}'
                GROUP BY
                    f.flight_id,
                    o_airport.name,
                    d_airport.name,
                    r.base_fare,
                    r.distance,
                    f.departure_time,
                    r.flight_time
                ORDER BY f.departure_time ASC;
            `);

            return flight_data.rows;
        } catch (query_err) {

            // query failed
            throw new Error(`Flights Query failed: ${query_err}`)
        }
    }

    // query seats
    async query_seats(flight_id) {
        try {
            const booked_seats_result = await this.database.raw(`
                SELECT seat_number
                FROM flight_seats
                WHERE flight_id = '${flight_id}'`
            );

            const seats = seats_status.map(seat => 
                ({ ...seat, status: false }));

            const bookedSet = new Set(booked_seats_result.rows.map(row => row.seat_number));
            for (const seat of seats) {
                if (bookedSet.has(seat.seat_number)) {
                    seat.status = true;
                }
            }

            return seats;

        } catch (err) {
            console.error(`Seats Query failed for flight_id ${flight_id}:`, err);
            throw new Error(`Seats Query failed: ${err.message}`);
        }
    }
}

// create a global scope database
const global_database_service = new DatabaseService();

// export the database service
module.exports = {
    GlobalDatabaseService: global_database_service
};
