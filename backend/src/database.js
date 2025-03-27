const knex = require('knex')({
	client: 'pg',
	connection: {
		host: "localhost",
		port: 5432,
		user: "postgres",
		password: "1234",
		database: "flight_app",
		ssl: false,
	}
});

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

module.exports = {check_connection, query_flights};
