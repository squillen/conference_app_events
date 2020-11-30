require('dotenv').config()
const { MongoClient } = require('mongodb')
const app = require('../server/index')
const EventsDAO = require('./dao/eventsDAO')
const LocationsDAO = require('./dao/locationsDAO')

const mongoURI = process.env.DB_URI || 'mongodb://localhost:27017/events-dev'
const port = process.env.PORT || 3000

const client = new MongoClient(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  poolSize: 50,
  connectTimeoutMS: 3000,
  keepAlive: 1,
})

async function connectToMongoDB () {
  try {
    await client.connect()
    const connections = [
      EventsDAO.injectDB(client),
      LocationsDAO.injectDB(client),
    ]
    await Promise.all(connections)
    console.info('::: Successfully connected to MongoDB :::')
    app.listen(port, () => {
      console.info(`::: SERVER STARTED! Listening on port ${port} :::`)
    })
  } catch (e) {
    console.error('::: UNABLE TO CONNECT :::', e)
  }
}

module.exports = { connectToMongoDB }
