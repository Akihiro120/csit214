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
        

        const flightDataExtras = await GlobalDatabaseService.query_flight_info(req.session.currentBooking.flight_id);

        if (flightDataExtras.length === 0) {
            return res.status(404).json({ error: "Flight not found" });
        }
        const flightData = flightDataExtras[0];
        const departure_time = flightData.dept_time;
        const arrival_time = flightData.arr_time;
        const departure_city = flightData.dept_city;
        const arrival_city = flightData.arr_city;


        req.session.currentBooking = {
            // this means not overwriting the old data object, just appending
            ...req.session.currentBooking,
            flight_id: data.flight_id,
            deptTime: departure_time,
            arrTime: arrival_time,
            toCity: arrival_city,
            fromCity: departure_city,
            flightTime: flightData.flight_time,
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