const amqp = require('amqplib/callback_api')
const { insertLocation, updateLocation } = require('../db/dao/locationsDAO')

const RABBIT_HOST = process.env.RABBIT_HOST || 'localhost'

function listenForLocationEvents (queue, cb) {
  amqp.connect(`amqp://${RABBIT_HOST}`, function (error0, connection) {
    if (error0) {
      throw error0
    }
    connection.createChannel(function (error1, channel) {
      if (error1) {
        throw error1
      }

      // This makes sure the queue is declared before attempting to consume from it
      channel.prefetch(1)
      channel.assertQueue(queue, {
        durable: true,
      })

      console.log(`::: AMQP LISTENING TO QUEUE: ${queue} :::`)

      channel.consume(queue, function (msg) {
        console.log('msg', msg)
        cb(msg)
        channel.ack(msg)
      }, {
        noAck: false,
      })
    })
  })
}

listenForLocationEvents('location.create', insertLocation)
listenForLocationEvents('location.modify', updateLocation)
