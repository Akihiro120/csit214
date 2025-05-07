const express = require("express");
const router = express.Router();
const { GlobalDatabaseService } = require("../services/database_service");

// constants for the price calculation
const YEAR_DAYS = 365.0;
const MONTH_DAYS = 31.0;
const T = YEAR_DAYS / MONTH_DAYS; // number of months in a year
const PRICE_PER_KILOMETER = 0.4; // base price per kilometer

// price calculation, thanks copilot
function get_day_of_year(date) {
  const start = new Date(date.getFullYear(), 0, 1);
  const diff = date - start;
  const one_day = 1000 * 60 * 60 * 24;
  return Math.floor(diff / one_day);
}

// calculate the additional variables that will impact the pricing of the seats
// or something like that
function calculate_variation(seats, departure) {
  // calculate seats
  const S = (1 / 3) * Math.log(1 + seats);

  // calculate seasons
  const P = (3 / 2) * Math.sin(((2 * Math.PI) / YEAR_DAYS) * departure) * 2.5;

  // get the possible variations
  return (S * P * T) / YEAR_DAYS;
}

function calculate_price_per_kilometer(distance) {
  // calculate the price per kilometer
  return PRICE_PER_KILOMETER * distance;
}

// calculate the total price with the variations and base price
// thanks desmos
function calculate_total_fare(base_fare, date, available_seats, distance) {
  // get the current date
  const x = get_day_of_year(new Date());
  const t = get_day_of_year(new Date(date));

  const distance_km = parseFloat(calculate_price_per_kilometer(distance));
  const r = parseFloat(calculate_variation(available_seats, t));

  // total fare calculation
  const exponent = -(r * (x - t));
  const numerator = YEAR_DAYS;
  const denom = 1 + Math.exp(exponent);
  return base_fare + numerator / denom + distance_km;
}

// creates the flights route
router.get("/api/flights", async (req, res) => {
  try {
    // flight params
    const { from, to, date, numPassengers, isReturn } = req.query;

    // return the response
    const response = await GlobalDatabaseService.query_flights(from, to, date);

    // calculate the total price
    // NOTE: possible improvement: move this to its own function
    const new_response_w_price_calculation = response.map((flight) => {
      const base_price = parseFloat(flight.base_fare);
      const day_of_departure = date;
      const available_seats = 170 - flight.booked_seats;
      const distance = parseFloat(flight.distance);

      return {
        ...flight,
        base_fare: calculate_total_fare(
          base_price,
          day_of_departure,
          available_seats,
          distance,
        ).toFixed(2),
      };
    });

    // send the response
    res.send({ flights: new_response_w_price_calculation });
  } catch (err) {
    // response failed
    console.log(err);
    res
      .status(500)
      .json({ error: "Failed to fetch flights", details: err.message });
  }
});

router.post("/api/flights", async (req, res) => {
  console.log(req.body);
  try {
    const { isReturn, numPassengers, deptDate, retDate } = req.body;
    // Validate input

    if (!deptDate) {
      return res.status(400).json({ error: "Departure date is required" });
    }
    
    if (isReturn == "true" && !retDate) {
      return res.status(400).json({ error: "Return date is required" });
    }
    if (isReturn !== "true" && isReturn !== "false") {
      return res.status(400).json({ error: "Invalid value for isReturn" });
    }
    if (!numPassengers || parseInt(numPassengers) == NaN || parseInt(numPassengers) < 1) {
      return res.status(400).json({ error: "Invalid value for numPassengers" });
    }
    if (numPassengers > 6) {
      return res.status(400).json({ error: "Too many passengers" });
    }

    // Check if session exists
    if (!req.session.currentBooking) {
      req.session.currentBooking = {};
    }

    isReturn = isReturn === "true"; // convert to boolean


    req.session.currentBooking = {
      // this means not overwriting the old data object, just appending
      ...req.session.currentBooking,
      numPassengers: numPassengers,
      isReturn: isReturn,
      timestamp: Date.now(),
    };

    req.session.save((err) => {
      if (err) {
        console.error("Session save error:", err);
        return res
          .status(500)
          .json({ error: "Failed to save session", details: err.message });
      }

      // Session saved successfully, now send response so front end can redirect
      console.log(
        "Session updated with booking details:",
        req.session.currentBooking,
      );
      res
        .status(200)
        .json({
          message: "Flight details added to session",
          bookingInfo: req.session.currentBooking,
        });
    });
  } catch (err) {
    // response failed
    res
      .status(500)
      .json({
        error: "Failed to process flight selection",
        details: err.message,
      });
    console.log(err);
  }
});

module.exports = router;
