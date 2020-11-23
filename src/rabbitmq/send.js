// code leveraged from https://www.cloudamqp.com/blog/2015-05-19-part2-2-rabbitmq-for-beginners_example-and-sample-code-node-js.html
const amqp = require('amqplib/callback_api')
const RABBIT_HOST = process.env.RABBIT_HOST || 'localhost'
let amqpConn = null

function createRabbitMQChannels (queue, cb = () => {}) {
  amqp.connect(`amqp://${RABBIT_HOST}`, function (err, conn) {
    if (err) {
      console.error('::: AMQP ERROR :::', err.message)
      return setTimeout(() => createRabbitMQChannels(queue, cb), 1000) // try again
    }
    conn.on('error', function (err) {
      if (err.message !== 'Connection closing') {
        console.error('::: AMQP CONN ERROR :::', err.message)
      }
    })
    conn.on('close', function () {
      console.error('::: AMQP RECONNECTING :::')
      return setTimeout(() => createRabbitMQChannels(queue, cb), 1000) // try again
    })

    console.log(`::: AMQP CONNECTED TO QUEUE: ${queue} :::`)
    amqpConn = conn

    whenConnected(queue, cb)
  })
}

function whenConnected (queue, cb) {
  startPublisher()
  startWorker(queue, cb)
}

let pubChannel = null
const offlinePubQueue = []
function startPublisher () {
  amqpConn.createConfirmChannel(function (err, ch) {
    if (closeOnErr(err)) return
    ch.on('error', function (err) {
      console.error('::: AMQP CHANNEL ERROR :::', err.message)
    })
    ch.on('close', function () {
      console.log('::: AMQP CHANNEL CLOSED :::')
    })

    pubChannel = ch
    while (true) {
      const m = offlinePubQueue.shift()
      if (!m) break
      publish(m[0], m[1], m[2])
    }
  })
}

// method to publish a message, will queue messages internally if the connection is down and resend later
function publish (exchange, routingKey, content) {
  try {
    return pubChannel.publish(exchange, routingKey, content, { persistent: true },
      function (err, ok) {
        if (err) {
          console.error('::: AMQP PUBLISH ERROR :::', err)
          offlinePubQueue.push([exchange, routingKey, content])
          pubChannel.connection.close()
          return { error: 'Unable to publish' }
        } else if (ok) {
          console.log('MESSAGE PUBLISHED')
          return { success: 'Message published' }
        }
      })
  } catch (e) {
    console.error('::: AMQP PUBLISH ERROR :::', e.message)
    offlinePubQueue.push([exchange, routingKey, content])
  }
}

// A worker that acknowledges messages only if processed successfully
function startWorker (queue, cb) {
  amqpConn.createChannel(function (err, ch) {
    if (closeOnErr(err)) return
    ch.on('error', function (err) {
      console.error('::: AMQP ERROR ::: channel error', err.message)
    })
    ch.on('close', function () {
      console.log('::: AMQP ERROR ::: channel closed')
    })
    ch.prefetch(10)
    ch.assertExchange(queue, 'fanout', { durable: false }, function (err, res) {
      if (closeOnErr(err)) return
      ch.consume(queue, processMsg, { noAck: false })
      console.log(`::: AMQP EXCHANGE WORKER STARTED FOR QUEUE ${queue} :::`)
    })
    // ch.assertQueue(queue, { durable: true }, function (err, res) {
    //   if (closeOnErr(err)) return
    //   ch.consume(queue, processMsg, { noAck: false })
    //   console.log(`::: AMQP WORKER STARTED FOR QUEUE ${queue} :::`)
    // })
    async function processMsg (msg) {
      try {
        const success = work(msg)
        if (success) ch.ack(msg)
        else ch.reject(msg, true)
      } catch (e) {
        closeOnErr(e)
      }
    }

    function work (msg) {
      try {
        cb(msg)
        console.log(msg.content.toString())
        return true
      } catch (e) {
        console.error(e)
        return false
      }
    }
  })
}

function closeOnErr (err) {
  if (!err) return false
  console.error('::: AMQP ERROR. AMQP CLOSING :::', err)
  amqpConn.close()
  return true
}

function publishMessage (message, routingKey) {
  return publish(routingKey, routingKey, Buffer.from(message))
}

module.exports = { publishMessage, createRabbitMQChannels }
