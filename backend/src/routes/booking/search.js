const express = require("express");
const router = express.Router();
const { GlobalDatabaseService } = require("../../services/database_service");

// post route for api
router.post("/api/booking/search", async (req, res) => {
	try {
		const session = req.session;
		const data = req.body;

		if (!data || Object.keys(data).length === 0) {
			console.log("Attempted to save empty session data");
			return res.status(400).json({ message: "No session data provided" });
		}

		if (!session) {
			console.log("no Session Token Attached on flight booking");
			return res.status(500).json({ message: "Session not initialized" });
		}

		if (!data.flight_id) {
			console.log("wrong data attached");
			return res.status(400).json({ message: "no flight attached in post" });
		}

		// query_flight_info should return a single object or null/undefined
		const flightInfo = await GlobalDatabaseService.query_flight_info(data.flight_id); // Renamed for clarity

		// Corrected logging: flightInfo is the object itself
		console.log("Flight info from DB:", flightInfo);

		// Corrected "Not Found" check:
		// If query_flight_info returns null or undefined when not found
		if (!flightInfo) {
			console.log(`Flight with ID ${data.flight_id} not found.`);
			return res.status(404).json({ error: "Flight not found" });
		}

		// Now you can safely access properties using dot notation
		// This console.log should work if the object is structured as expected
		console.log("Dept City from flightInfo:", flightInfo.dept_city);

		req.session.currentBooking = {
			...req.session.currentBooking, // Preserves other booking details if any
			flight_id: data.flight_id,
			dept_city: flightInfo.dept_city,
			arr_city: flightInfo.arr_city,
			dept_time: flightInfo.dept_time,
			arr_time: flightInfo.arr_time,
		};

		req.session.save((err) => {
			if (err) {
				console.error("Session save error:", err);
				return res.status(500).json({ error: "Failed to save session", details: err.message });
			}

			// Session saved successfully, now send 200 so front end can redirect
			console.log("Session updated with booking details:", req.session.currentBooking);
			res.status(200).json({
				message: "Flight details added to session",
				bookingInfo: req.session.currentBooking,
			});
		});
	} catch (err) {
		console.error("An unexpected error occurred:", err);
		return res.status(500).json({ message: "An unexpected error occurred", details: err.message });
	}
});

module.exports = router;
