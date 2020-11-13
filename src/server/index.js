const express = require('express')
const app = express()
const bodyParser = require('body-parser')

// ROUTES
const events = require('./events/events.routes.js')
const notifications = require('./notifications/notifications.routes.js')

app.use(bodyParser.json())

app.use('/event', events)
app.use('/api/notifications', notifications)

module.exports = app
