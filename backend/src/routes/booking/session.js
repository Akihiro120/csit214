const express = require('express');
const router = express.Router();

// GET session data
router.get('/api/booking/session', (req, res) => {
    const session = req.session;

    // all data related to the current booking is now stored at session.currentBooking. I should make an interface for this
    // no more session.data or session.user, we can use them later if we want to do accoutns.
    const responseData = {};
    if (session.currentBooking) {
        responseData.currentBooking = session.currentBooking;
    }

    console.log("Returning session data:", responseData);
    res.status(200).json(responseData);
});

router.post('/api/booking/session', (req, res) => {
    const session = req.session;
    const data = req.body; 

    if (!data || Object.keys(data).length === 0) {
        console.log('Attempted to save empty session data');
		return res.status(400).json({ message: "No session data provided" });
    }

    if (!session) {
        console.log('Session not initialized');
        return res.status(500).json({ message: "Session not initialized" });
    }

    // Merge new data into session.currentBooking instead of session.data
    session.currentBooking = {
        ...(session.currentBooking || {}), // Spread existing currentBooking data
        ...data                          // Spread new data from req.body (e.g., { initialized: ... })
    };

    session.save(err => {
        if (err) {
			console.error("Error saving session:", err);
			return res.status(500).json({ message: "Failed to save session" });
		}

		console.log(`Session saved. Session ID: ${session.id}`);
		console.log("Session After Save:", session);

		res.status(200).json({
			message: "Session data updated",
			currentBooking: session.currentBooking, // sanity check, returns the data from post after updating.
            // also this 200 gets used to redirect the user to the next page
		});
    });
});

// export the router
module.exports = router;