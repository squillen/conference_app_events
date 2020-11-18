const { connectToMongoDB } = require('./db/index')
const { insertLocation, updateLocation } = require('./db/dao/locationsDAO')
const { createRabbitMQChannels } = require('./rabbitmq/send')
// const { listenForLocationEvents } = require('./rabbitmq/listen')

// connect to mongo
connectToMongoDB()

// send events on rabbitmq
createRabbitMQChannels('event.create')
createRabbitMQChannels('event.modify')

// receive events on rabbitmq
createRabbitMQChannels('location.create', insertLocation)
createRabbitMQChannels('location.modify', updateLocation)
