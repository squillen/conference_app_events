const { connectToMongoDB } = require('./db/index')
const { insertLocation, updateLocation } = require('./db/dao/locationsDAO')
const { publishMessagesOnRabbitMQ } = require('./rabbitmq/send')
const { listenForLocationEvents } = require('./rabbitmq/listen')

// connect to mongo
connectToMongoDB()

// send events on rabbitmq
publishMessagesOnRabbitMQ('event.create')
publishMessagesOnRabbitMQ('event.modify')

// receive events on rabbitmq
listenForLocationEvents('location.create', insertLocation)
listenForLocationEvents('location.modify', updateLocation)
