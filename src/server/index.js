const express = require('express')
const app = express()
const bodyParser = require('body-parser');

// ROUTES
const events = require('./events/events.routes.js')

app.use(bodyParser.json());

app.use('/event', events)

module.exports = app;