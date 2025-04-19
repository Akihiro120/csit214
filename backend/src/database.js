const seats_status = require('./seats')

const knex = require('knex')({
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

console.log('Database configuration loaded successfully');

function check_connection() {
	return knex.raw('SELECT * FROM airport');
}

// return all airports
function query_airports() {
	return knex.raw(
		"SELECT * FROM airport"
	);
}

// query flights
function query_flights(from, to, date) {
// 	Departing City Name  (join from the airport table)
// Arriving City Name (join from the airport table)
// Base price (join from the route table)
// Flight time (join from the route table)
// Departure time (from the flights tab, no join needed)
// Arrive time (calculated from route table, dept time + flight time)
// I don't need, but is helpful to have in the response object: FlightId
	return knex.raw(`
		SELECT 
			 f.flight_id,
			 o_airport.name AS dept_city,
			 d_airport.name AS arr_city,
			 r.base_fare,
			 f.departure_time AS dept_time,
			 (r.flight_time + f.departure_time) AS arr_time
		FROM flights f
		INNER JOIN route r ON r.route_id = f.route_id
		INNER JOIN airport o_airport ON r.origin_airport_code = o_airport.airport_code
		INNER JOIN airport d_airport ON r.destination_airport_code = d_airport.airport_code
		WHERE r.origin_airport_code = 'MEL' 
		  AND r.destination_airport_code = 'SYD'
		  AND f.flight_date = '2025-04-21'
		ORDER BY f.departure_time ASC;
	`);
}

// query seats
async function query_seats(flight_id) {
  try { hc
   	const booked_seats_result = await knex.raw(`
   		SELECT seat_number
      	FROM flight_seats
      	WHERE flight_id = ${flight_id};
   	`);
		const seats = seats_status;//{...seats_status};
    
		for (var i = 0; i < booked_seats_result.rows.length; i++) {
			const number = booked_seats_result.rows[i].seat_number;
			const seat = seats.find(seat => seat.seat_number == number);
			if (seat) {
				seat.status = true;
			}
		}

   	return seats;
  	} 	catch (err) {
    	console.log("Failed to obtain seats:", err);
    	throw err;
  	}
}

module.exports = {check_connection, query_flights, query_seats};
