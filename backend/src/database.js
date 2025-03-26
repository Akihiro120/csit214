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

module.exports = {check_connection};
