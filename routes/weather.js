const express = require("express");
const { body } = require("express-validator");
const router = express.Router();
const request = require("request");


const apiKey = "14e317b51ed8ace1e8bdba1b93c912e4"; // Replace with your API key

// Display the weather form
router.get("/", (req, res) => {
  res.render("weatherForm", { weather: null });
});

router.post("/", function (req, res, next) {
  const city = req.sanitize(req.body.city);
  const url = `http://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`;


  request(url, function (err, response, body) {
    if (err) {
      return next(err);  // Pass error to error-handling middleware
    } else {
      var weatherData = JSON.parse(body)
      if (weatherData.cod === 200) {
        // Render the weather form with weather data
        res.render("weatherForm", { weather: weatherData, error: null });
      } else {
        // Display an error if the city is not found
        res.send ("No data found");
      }
    }
  });
});

module.exports = router;