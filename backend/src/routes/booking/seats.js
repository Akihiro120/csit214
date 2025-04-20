const express = require('express');
const router = express.Router();
const {GlobalDatabaseService} = require('../../services/database_service');

// creates the seats route
router.get('/api/booking/seats', async (req, res) => {
    try {
        // flight params
        const {flight_id} = req.query;

        // return the response
        const response = await GlobalDatabaseService.query_seats(flight_id);
        res.send(response);
    } catch (err) {
        // response failed
        res.status(500).json({ error: 'Failed to fetch seats', details: err.message });
    }
});

module.exports = router;