const express = require("express");
const bodyParser = require("body-parser");
const { sequelize } = require("./repos/model");
const { parseHeaders } = require("./middleware/parseHeaders");
const routes = require("./routes");

const app = express();
app.use(bodyParser.json());
app.use(parseHeaders);
app.set("sequelize", sequelize);
app.set("models", sequelize.models);

// Set routes
app.use(routes);

module.exports = app;
