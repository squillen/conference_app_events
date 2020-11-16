const amqp = require('amqplib/callback_api')

function listenForLocationEvents (queue) {
  amqp.connect('amqp://localhost', function (error0, connection) {
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

      console.log(`Listening for ${queue} events`)

      channel.consume(queue, function (msg) {
        channel.ack(msg)
      }, {
        noAck: false,
      })
    })
  })
}

listenForLocationEvents('location.create')
listenForLocationEvents('location.modify')
