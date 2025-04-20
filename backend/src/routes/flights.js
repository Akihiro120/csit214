const express = require('express');
const router = express.Router();
const {GlobalDatabaseService} = require('../services/database_service');

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
        const { flightID, numPassengers } = req.body;
        if (!flightID || !numPassengers) {
            return res.status(400).json({ error: 'Missing flightID or numPassengers' });
        }

        req.session.currentBooking = {
            // this means not overwriting the old data object, just appending
            ...req.session.currentBooking,
            flightID: flightID,
            passengers: numPassengers,
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
    }
});

module.exports = router;