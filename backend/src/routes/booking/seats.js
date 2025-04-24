const express = require('express');
const router = express.Router();
const {GlobalDatabaseService} = require('../../services/database_service');

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

module.exports = router;