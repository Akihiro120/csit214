const express = require('express');
const router = express.Router();

// import the database query functions
const {
	check_connection,
	query_flights

} = require('./database');

// confirm base connection
router.get('/api/', (_, res) => {
	// determine connection status
	check_connection()
		.then(() => {
			console.log("Database connection successful");
			res.send("8==D");
		})
		.catch((err) => {
			console.log("Error connecting to database: ", err);
			res.send(err);
		});	
});

router.get('/api/flights', (req, res) => {
	var flight_params = req.query;

	var flight_from = flight_params.from;
	var flight_to = flight_params.to;
	var flight_date = flight_params.date;
	var flight_flex = flight_params.flex;

	// return response in JSON from database
	query_flights(flight_to, flight_from, flight_date, flight_flex)
		.then((result) => {
			res.send(result.rows);
		})
		.catch((err) => {
			res.send(err);
		});
});

// export the router
module.exports = router;
