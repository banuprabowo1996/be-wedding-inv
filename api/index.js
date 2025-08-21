const app = require("../app");

module.exports = (req, res) => {
  app(req, res); // forward request ke express
};
