const express = require('express');
const router = express.Router();

// get for a user session
router.get('/api/booking/session', (req, res) => {
    
    // get the session if applicable
    const session = req.session;

    if (session?.data) {
		return res.status(200).json({ data: session.data });
	}

    // return empty data, nothing exsits
	return res.status(204).send();
});


//handle post request for creation of a session
router.post('/api/booking/session', (req, res) => {
    // get the session (key) and data (value)
    const session = req.session;
    const data = req.body; 

    // if the payload is empty
    if (!data || Object.keys(data).length === 0) {
        console.log('Attempted to save empty session data');
		return res.status(400).json({ message: "No session data provided" });
    }

    // if the session is empty
    // this could be from a 1 in 2^128 chance of key collison
    if (!session) {
        console.log('Session not initialized');
        return res.status(500).json({ message: "Session not initialized" });
    }

    // on this route, a session should only contain a timestamp, and numPassangers
    if (data.length > 2) {
        console.log('hand written session overloading');
        return res.status(400).json({ message: "Session data is too large" });
    }

    session.data = data;
    session.save(err => {
        if (err) {
			console.error("Error saving session:", err);
			return res.status(500).json({ message: "Failed to save session" });
		}

		console.log(`Session saved. Session ID: ${session.id}`);
		console.log("Session After Save:", session);

		res.status(200).json({
			message: "Session data saved",
			data: session.data,
		});
    });
});

// export the router
module.exports = router;