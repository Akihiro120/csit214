const express = require('express');
const router = express.Router();
const {GlobalDatabaseService} = require('../services/database_service');


// example Post request body: {"numPassengers":1,"isRoundTrip":false}
// creates the flights route
router.get('/api/flights', async (req, res) => {
    try {
        // flight params
        const {from, to, date, flex} = req.query;

        // return the response
        const response = await GlobalDatabaseService.query_flights(from, to, date);
        res.send(response);
    } catch (err) {
        // response failed
        res.status(500).json({ error: 'Failed to fetch flights', details: err.message });
    }
});

router.post('/api/flights', async (req, res) => {
    try {
        const { isRoundTrip, numPassengers } = req.body;
        // Validate input
        if (typeof isRoundTrip !== 'boolean') {
            return res.status(400).json({ error: 'Invalid value for isRoundTrip' });
        }
        if (typeof numPassengers !== 'number' || numPassengers <= 0) {
            return res.status(400).json({ error: 'Invalid value for numPassengers' });
        }
        if (numPassengers > 6) {
            return res.status(400).json({ error: 'Too many passengers' });
        }

        // Check if session exists
        if (!req.session.currentBooking) {
            req.session.currentBooking = {};
        }
        

        req.session.currentBooking = {
            // this means not overwriting the old data object, just appending
            ...req.session.currentBooking,
            numPassengers: numPassengers,
            isRoundTrip: isRoundTrip,
            timestamp: Date.now()
        };

        req.session.save((err) => {
            if (err) {
                console.error("Session save error:", err);
                return res.status(500).json({ error: 'Failed to save session', details: err.message });
            }
            
            // Session saved successfully, now send response so front end can redirect
            console.log("Session updated with booking details:", req.session.currentBooking);
            res.status(200).json({ message: 'Flight details added to session', bookingInfo: req.session.currentBooking });
        });
    }
    catch (err) {
        // response failed
        res.status(500).json({ error: 'Failed to process flight selection', details: err.message });
        console.log(err);
    }
});

module.exports = router;