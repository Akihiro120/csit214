const express = require('express');
const router = express.Router();
const {GlobalDatabaseService} = require('../../services/database_service');



function determineClass(seat){
    const first_class_seats = ["1A", "1B", "1E", "1F", "2A", "2B", "2E", "2F"];
    const business_class_seats =  [];

    return;
}
// creates the seats route
router.get('/api/booking/seats', async (req, res) => {
    try {
        session = req.session;
        console.log("Session data:", session.currentBooking);
        const flightId = req.session.currentBooking.flight_id;

        if (!flightId) {
            return res.status(400).json({ error: 'No flight selected, no data for this page to load' });
        }
        
        const response = await GlobalDatabaseService.query_seats(flightId);
        res.send({seats: response});
    } catch (err) {
        // response failed
        res.status(500).json({ error: 'Failed to fetch seats', details: err.message });
    }

});

router.post('/api/booking/seats ', async (req, res) => {
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

        if (!data.currentBooking.passengers) {
            console.log('no passengers in this post');
            return res.status(500).json({ message: 'no passengers in post, which means no seats, dumbass'});
        }

        if (!session.currentBooking.num_passengers  == data.passengers.length()) {
            console.log('not enough passengers in post to match numPassengers selected in homepage');
            return res.status(500).json({ message: `you said there were ${session.currentBooking.num_passengers} and there are only ${data.num_passengers.length()} passenger objects in your post, dumbass`});
        }


        const passangerArray = data.passangers.map(passanger => {
            return {
                name: passanger.name,
                email: passanger.email,
                phone: passanger.phone || null,
                seat: passanger.seat
            }


        });

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
        console.error("An unexpected error occurred on seats post:", err);
		return res.status(500).json({ message: "An unexpected error occurred", details: err.message });
    }



});

module.exports = router;