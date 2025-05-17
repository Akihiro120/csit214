const express = require("express");
const router = express.Router();
const { GlobalDatabaseService } = require("../services/database_service");


// constants for the price calculation
const PRICE_PER_KILOMETER = 0.2; // base price per kilometer, based on research at 40c per kilometer

//  weights for different multipliers
const SEAT_SCARCITY_WEIGHT = 2.0;
const DAYS_UNTIL_FLIGHT_WEIGHT = 1;
const TIME_OF_DEPARTURE_WEIGHT = 0.2;


// helper functions:
// function to turn '11:15:00' into 11.25 etc
function convertTimeToFloat(time) {
  const timeString = time.split(':');
  const hours = parseInt(timeString[0]);
  const minutes = parseInt(timeString[1]);
  const seconds = parseInt(timeString[2]);
  return ((hours) + (minutes/60) + seconds/3600);
}
// date is given as YYYY-MM-DD, returns days between now and the date
function calculate_days_until_flight(day_of_departure){
  const now = new Date();

  const date_parts = day_of_departure.split("-");
  const year = parseInt(date_parts[0]);
  const month = parseInt(date_parts[1]) - 1; // Months are zero-based in JavaScript
  const day = parseInt(date_parts[2]);
  const day_of_departure_date = new Date(year, month, day);

  const diff = day_of_departure_date - now; // returns unix milliseconds
  const days_until_flight = Math.floor(diff / (1000 * 60 * 60 * 24));
  return days_until_flight;
} 




// uses some crazy e numbers that pass through 0.1 at 30, and 0.9 at 1
function calculate_days_until_flight_multiplier(day_of_departure) {
  days_until_flight = calculate_days_until_flight(day_of_departure);
  magic_a = 0.970849;
  magic_b = 0.927025;
  const urgency = (magic_a * Math.pow(magic_b, days_until_flight));
  return urgency * DAYS_UNTIL_FLIGHT_WEIGHT;
}


// reused some crazy magic e numbers that pass through 0.1 at 30, and 0.9 at 1
function calculate_seats_left_multiplier(seats) {
  const seats_left = 170-seats;
  const magic_a = 0.970849;
  const magic_b = 0.927025;
  const scarcity = (magic_a * Math.pow(magic_b, seats_left));
  return scarcity * SEAT_SCARCITY_WEIGHT;
}


// this is a parabola 24 wide, with a max at 12, and roots at 0 and 24, roots are defined as +1.0
function calculate_time_based_multiplier(time_of_day, max_multiplier) {
    const midday_hour = 12.0; 
    const multiplier_at_roots = 1.0;
    
    // The parabola is y = A(x - h)^2 + k
    const A = (multiplier_at_roots - max_multiplier) / Math.pow(midday_hour, 2);

    // Calculate the multiplier for the given time of day
    const time_multiplier = A * Math.pow(time_of_day - midday_hour, 2) + max_multiplier;
    return time_multiplier * TIME_OF_DEPARTURE_WEIGHT;
}

// linear function to calculate the price per kilometer
function calculate_price_per_kilometer(distance) {
  return PRICE_PER_KILOMETER * distance;
}


// all functions called either return a "multiplier" between 0 and 1, multiplied by weights, or just a float.
// means we can Tune the weights of pricing to look legit
function calculate_total_fare(base_price, date, available_seats, distance, dept_time) {
  const base_price_float = parseFloat(base_price);
  const fuel_cost = calculate_price_per_kilometer(distance);
  const time_of_day_cost = calculate_time_based_multiplier(convertTimeToFloat(dept_time), 3.0);
  const seat_scarcity = calculate_seats_left_multiplier(available_seats);
  const days_until_flight = calculate_days_until_flight_multiplier(date);
  const final_price = base_price_float + fuel_cost * (1+time_of_day_cost) * (1+seat_scarcity) * (1+days_until_flight);
  return final_price;
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
      const dept_time = flight.dept_time;

      return {
        ...flight,
        base_fare: calculate_total_fare(
          base_price,
          day_of_departure,
          available_seats,
          distance,
          dept_time,
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
  console.log("Flight selection request received:", req.body);
  try {
    const { to, from, isReturn, numPassengers, deptDate, retDate } = req.body;
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

    let isReturnBool = isReturn === "true"; // convert to boolean

    req.session.currentBooking = {
      // this means not overwriting the old data object, just appending
      ...req.session.currentBooking,
      to: to,
      from: from,
      dept_date: deptDate,
      ret_date: isReturnBool ? retDate : null,
      num_passengers: numPassengers,
      isReturn: isReturnBool,
      search_time_stamp: Date.now(),
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
