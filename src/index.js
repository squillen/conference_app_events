const { connectToMongoDB } = require('./db/index')
const { connectToRabbit } = require('./rabbitmq/send')

// connect to mongo
connectToMongoDB()

// connect to rabbitmq
connectToRabbit('event.create')
connectToRabbit('event.modify')
