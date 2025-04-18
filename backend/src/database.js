const environment_path = require('path');
const dotenv = require('dotenv');
const seats_status = require('./seats')

// load envonrment vairbales
const env_path = environment_path.resolve(__dirname, '../../.env');
dotenv.config({path: env_path});

console.log("Environment Variables Loaded: ", process.env);

// database knex
console.log("Environment Loaded from: ", env_path);
// const knex = require('knex')({
// 	client: 'pg',
// 	connection: {
// 		host: 'localhost',
// 		port: process.env.POSTGRES_PORT,
// 		user: process.env.POSTGRES_USER,
// 		password: process.env.POSTGRES_PASSWORD,
// 		database: process.env.POSTGRES_DB,
// 		ssl: false,
// 	}
// });
const knex = require('knex')({
	client: 'pg',
	connection: {
		host: 'localhost',
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
function query_flights(to, from, date, flex) {
	return knex.raw(`
		SELECT flight_id, flight_number
		FROM flights
		WHERE route_id = (
			SELECT route_id
			FROM route
			WHERE origin_airport_code = '${to}' AND destination_airport_code = '${from}'
		) AND flight_date = '${date}';
	`);
}

// query seats
async function query_seats(flight_id) {
  try {
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
