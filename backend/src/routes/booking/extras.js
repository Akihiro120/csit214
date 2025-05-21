const express = require("express");
const router = express.Router();
const { GlobalDatabaseService } = require("../../services/database_service");

router.post("/api/booking/extras", async (req, res) => {
    try {
        const session = req.session;
        const data = req.body;

        if (!data || Object.keys(data).length === 0) {
            console.log("Attempted to save empty session data");
            return res
                .status(400)
                .json({ message: "No session data provided" });
        }

        if (!session.currentBooking) {
            console.log("Session Token expired, failed flight booking");
            return res.status(500).json({ message: "Session not initialized" });
        }
        if (!data.extras) {
            console.log("No extras data provided");
            return res.status(400).json({ message: "No extras data provided" });
        }

        // Check if currentBooking exists
        if (!req.session.currentBooking) {
            console.log("currentBooking not found in session");
            return res.status(500).json({
                message:
                    "Passenger data not found in session (currentBooking missing)",
            });
        }

        // Check if passengers array exists and is an array
        if (
            !req.session.currentBooking.passengers ||
            !Array.isArray(req.session.currentBooking.passengers)
        ) {
            console.log(
                "passengers array not found or not an array in currentBooking",
            );
            return res.status(500).json({
                message:
                    "Invalid passenger data structure in session (passengers array missing or not an array)",
            });
        }

        // Check if the passengers array is empty
        if (req.session.currentBooking.passengers.length === 0) {
            console.log("passengers array is empty in currentBooking");
            return res.status(500).json({
                message:
                    "No passengers found in session (passengers array is empty)",
            });
        }

        // Check if the first passenger object exists
        if (!req.session.currentBooking.passengers[0]) {
            console.log(
                "First passenger object is undefined in passengers array",
            );
            return res.status(500).json({
                message:
                    "Passenger detail missing in session (first passenger undefined)",
            });
        }

        req.session.currentBooking.passengers[0].extras = data.extras;

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
                "Session updated with passenger extras:",
                req.session.currentBooking,
            );
            res.status(200).json({
                message: "Selections added to session",
                bookingInfo: req.session.currentBooking,
            });
        });

        console.log(data.extras);
        console.log(req.session.currentBooking.passengers[0].extras);
    } catch (err) {
        console.error("An unexpected error occurred on extras post:", err);
        return res.status(500).json({
            message: "An unexpected error occurred",
            details: err.message,
        });
    }
});

module.exports = router;

