const express = require("express");
const router = express.Router();
const { GlobalDatabaseService } = require("../../services/database_service");

router.post("/api/booking/payment", async (req, res) => {
    try {
        const session = req.session;
        const data = req.body;

        if (!data || Object.keys(data).length === 0) {
            console.log("Attempted to save empty session data");
            return res
                .status(400)
                .json({ message: "No session data provided" });
        }

        if (!session) {
            console.log("no Session Token Attached on flight booking");
            return res.status(500).json({ message: "Session not initialized" });
        }

        req.session.currentBooking = {
            ...req.session.currentBooking, // Preserves other booking details if any
            paymentDetails: data.paymentDetails,
        };

        req.session.save((err) => {
            if (err) {
                console.error("Session save error:", err);
                return res.status(500).json({
                    error: "Failed to save session",
                    details: err.message,
                });
            }

            // Session saved successfully, now send 200 so front end can redirect
            console.log(
                "Session updated with booking details:",
                req.session.currentBooking,
            );
            res.status(200).json({
                message: "Flight details added to session",
                bookingInfo: req.session.currentBooking,
            });
        });

        // turn off expiry on session token for safety
        // make html object to go in rest api for email
        // send request to email that includes:
        // dep loc, arr loc
        // distance
        // dep date
        // arr date
        // name
        // flgiht service name
        // services: food, plane name, entertainment
        // flight time
        const paymentData = req.body;
        const sessionData = req.session.currentBooking;
        console.log(paymentData);
        console.log(sessionData);
    } catch (err) {
        console.error("An unexpected error occurred on seats post:", err);
        return res.status(500).json({
            message: "An unexpected error occurred",
            details: err.message,
        });
    }
});

module.exports = router;
