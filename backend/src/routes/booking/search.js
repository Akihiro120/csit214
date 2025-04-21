// { flight_id: flightId }
const express = require('express');
const router = express.Router();


// post route for api
router.post('/api/booking/search', async (req, res) => {
    try {
    
        const session = req.session;
        const data = req.body; 

        if (!data || Object.keys(data).length === 0) {
            console.log('Attempted to save empty session data');
            return res.status(400).json({ message: "No session data provided" });
        }

        if (!session) {
            console.log('no Session Token Attached on flight booking');
            return res.status(500).json({ message: "Session not initialized" });
        }

        if (!data.flight_id) {
            console.log("wrong data attached")
            return res.status(400).json({message: "no flight attached in post"});
        }
        
        console.log(req.session.currentBooking)
        req.session.currentBooking = {
            // this means not overwriting the old data object, just appending
            ...req.session.currentBooking,
            flight_id: data.flight_id
        };

        req.session.save((err) => {
            if (err) {
                console.error("Session save error:", err);
                return res.status(500).json({ error: 'Failed to save session', details: err.message });
            }
            
            // Session saved successfully, now send 200 so front end can redirect
            console.log("Session updated with booking details:", req.session.currentBooking);
            res.status(200).json({ message: 'Flight details added to session', bookingInfo: req.session.currentBooking });
        });
    } catch (err) {
        console.error("An unexpected error occurred:", err);
        return res.status(500).json({ message: "An unexpected error occurred", details: err.message });
    }
});



module.exports = router;