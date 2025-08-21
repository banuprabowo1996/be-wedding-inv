const app = require("./app"); // import express app

module.exports = (req, res) => {
  app(req, res); // forward ke express
};
