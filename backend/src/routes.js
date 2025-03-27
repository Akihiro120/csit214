const express = require('express');
const router = express.Router();

// import the database query functions
const {
	check_connection,
	query_flights

} = require('./database');

// confirm base connection
router.get('/', (_, res) => {
	// determine connection status
	check_connection()
		.catch((err) => {
			res.send(err);
		});	
});

router.get('/flights', (req, res) => {
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
