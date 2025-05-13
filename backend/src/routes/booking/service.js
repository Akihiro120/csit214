const express = require('express');
const router = express.Router();
const {GlobalDatabaseService} = require('../../services/database_service');

// creates the seats route
router.get('/api/booking/seats', async (req, res) => {
    try {

    }
    catch (err) {
        console.error("An unexpected error occurred:", err);
        return res.status(500).json({ message: "An unexpected error occurred", details: err.message });
        }
    }
);