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

module.exports = router;