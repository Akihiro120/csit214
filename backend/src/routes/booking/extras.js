const express = require('express');
const router = express.Router();
const {GlobalDatabaseService} = require('../../services/database_service');




router.post('/api/booking/extras', async (req, res) => {
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

        if (!data.passengers || !Array.isArray(data.passengers)) {
            console.log('No passengers in this post');
            return res.status(400).json({ message: 'No passenger information provided' });
        }

        if (!session.currentBooking || !session.currentBooking.passengers) {
            console.log('No existing passengers in session');
            return res.status(400).json({ message: 'No passenger data found in session' });
        }


        const updatedPassengers = session.currentBooking.passengers.map((sessionPassenger, index) => {
            const matchingPassenger = data.passengers.find(p => 
                p.email === sessionPassenger.email && p.name === sessionPassenger.name
            ) || data.passengers[index];
            
            if (!matchingPassenger) {
                return sessionPassenger; // Keep original if no match found
            }

            // Append options to the existing passenger data
            return {
                ...sessionPassenger,
                options: {
                    meal: matchingPassenger.options?.meal || 'standard',
                    baggage: matchingPassenger.options?.baggage || 'none',
                    carry_on: matchingPassenger.options?.carry_on || 'none',
                    entertainment: matchingPassenger.options?.entertainment || 'basic'
                }
            };
        });

        req.session.currentBooking = {
            ...req.session.currentBooking,
            passengers: updatedPassengers,
        }

		req.session.save((err) => {
			if (err) {
				console.error("Session save error:", err);
				return res.status(500).json({ error: "Failed to save session", details: err.message });
			}

			// Session saved successfully, now send 200 so front end can redirect
			console.log("Session updated with passenger extras:", req.session.currentBooking);
			res.status(200).json({
				message: "Selections added to session",
				bookingInfo: req.session.currentBooking,
			});
		});
        

    } catch (err) {
        console.error("An unexpected error occurred on extras post:", err);
		return res.status(500).json({ message: "An unexpected error occurred", details: err.message });
    }



});

module.exports = router;