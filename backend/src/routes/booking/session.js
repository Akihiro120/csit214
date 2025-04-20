const express = require('express');
const router = express.Router();

// get the current session data
router.get('/api/booking/session', (req, res) => {
    
    // get the session if applicable
    const session = req.session;

    // get the session user
    if (session?.user) {
        return res.status(200).json({ user: session.user });
    }

    // get the session use
    if (session?.data) {
		return res.status(200).json({ data: session.data });
	}

    // return empty data, nothing exsits
	return res.status(204).send();
});

// posts session data
// NOTE: i got zero fucking clue on what is happening here, posssible skill issue
router.post('/api/booking/session', (req, res) => {
    // get the session and data
    const session = req.session;
    const data = req.body; 

    // if the payload is empty
    if (!data || Object.keys(data).length === 0) {
        console.log('Attempted to save empty session data');
		return res.status(400).json({ message: "No session data provided" });
    }

    console.log("Session before Save: ", session);

    // set the session data to the newer data
    session.data = data;

    // save the session
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