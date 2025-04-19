const express = require('express');
const router = express.Router();

// import the database query functions
const {
	check_connection,
	query_flights,
	query_seats
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

router.get('/api/booking/seats', (req, res) => {
	var query_params = req.query;

	// testing
	// 0003baf6-27d5-4fe1-a014-d9e923583987
	var flight_id = query_params.flightid;

	var seats = query_seats(flight_id)
		.then((seats) => {
			res.send(seats);
		})
		.catch(() => {
			res.send("failed to fetch seats");
		});
});

// GET route to check current session status
router.get('/api/booking/session', (req, res) => {
	// express-session automatically loads session data based on the cookie
	if (req.session && req.session.user) { 
		// If you store user data in req.session.user upon login
		res.send({ user: req.session.user });
	} else if (req.session && req.session.data) {
		// Or if you are storing generic data like in your POST example
		res.send({ data: req.session.data }); // Send back whatever data is relevant
	} else {
		// No active session or no relevant data in session
		res.send({}); // Send an empty object or appropriate status
	}
});

// posts session data
router.post('/api/booking/session', (req, res) => {
	console.log("Session Before POST: ", req.session);
	// Store the actual body sent by the frontend, or a specific part of it
	// Option 1: Store the whole body (e.g., { initialized: 17... })
	req.session.data = req.body; 
	// Option 2: Store just a flag indicating initialization
	// req.session.initialized = true;

	// IMPORTANT: If this is the *first* time data is saved to the session,
	// express-session will now generate the Session ID and send the Set-Cookie header.

	req.session.save((err) => {
		if (err) {
			console.log("Error saving session: ", err);
			return res.status(500).send("Error saving session");
		}
		console.log(`Session saved successfully. Cookie should be set now. Session ID: ${req.sessionID}`); 
		console.log("Session After POST & Save: ", req.session);
		// Send back the data that was actually saved
		res.send({ message: "Session data received", data: req.session.data }); 
	});

});

// export the router
module.exports = router;
