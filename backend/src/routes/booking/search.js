const express = require('express');
const router = express.Router();
const { GlobalDatabaseService } = require('../../services/database_service');


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
        

        const flightDataExtras = await GlobalDatabaseService.query_flight_info(data.flight_id)[0];
        console.log("Flight data extras is a type of :", typeof flightDataExtras);
//   :48 {
// 2025-05-15 18:44:48   flight_id: 'c2b83dd6-6aef-49a3-9ec3-c6d081366fcb',
// 2025-05-15 18:44:48   dept_city: 'Sydney Airport',
// 2025-05-15 18:44:48   arr_city: 'Brisbane Airport',
// 2025-05-15 18:44:48   dept_time: '10:55:00',
// 2025-05-15 18:44:48   flight_time: PostgresInterval { hours: 1, minutes: 8 },
// 2025-05-15 18:44:48   arr_time: '12:03:00'
// 2025-05-15 18:44:48 }

        if (flightDataExtras.length === 0) {
            return res.status(404).json({ error: "Flight not found" });
        }
        console.log(flightDataExtras.dept_city);
        req.session.currentBooking = {

            ...req.session.currentBooking,
            flight_id: data.flight_id,
            fromCity: flightDataExtras[dept_city],
            toCity: flightDataExtras[arr_city],
            deptTime: flightDataExtras[dept_time],
            arrTime: flightDataExtras[arr_time],
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