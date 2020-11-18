// code leveraged from https://www.cloudamqp.com/blog/2015-05-19-part2-2-rabbitmq-for-beginners_example-and-sample-code-node-js.html
const amqp = require('amqplib/callback_api')
let amqpConn = null

function connect (queue) {
  amqp.connect('amqp://localhost', function (err, conn) {
    if (err) {
      console.error('::: AMQP ERROR :::', err.message)
      return setTimeout(() => connect(queue), 1000) // try again
    }
    conn.on('error', function (err) {
      if (err.message !== 'Connection closing') {
        console.error('::: AMQP CONN ERROR :::', err.message)
      }
    })
    conn.on('close', function () {
      console.error('::: AMQP RECONNECTING :::')
      return setTimeout(() => connect(queue), 1000) // try again
    })

    console.log('::: AMQP CONNECTED! :::')
    amqpConn = conn

    whenConnected(queue)
  })
}

function whenConnected (queue) {
  startPublisher()
  startWorker(queue)
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
    pubChannel.publish(exchange, routingKey, content, { persistent: true },
      function (err, ok) {
        if (err) {
          console.error('::: AMQP PUBLISH ERROR :::', err)
          offlinePubQueue.push([exchange, routingKey, content])
          pubChannel.connection.close()
        } else if (ok) {
          console.log('MESSAGE PUBLISHED')
        }
      })
  } catch (e) {
    console.error('::: AMQP PUBLISH ERROR :::', e.message)
    offlinePubQueue.push([exchange, routingKey, content])
  }
}

// A worker that acknowledges messages only if processed successfully
function startWorker (queue) {
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

    function processMsg (msg) {
      work(msg, function (ok) {
        try {
          if (ok) ch.ack(msg)
          else ch.reject(msg, true)
        } catch (e) {
          closeOnErr(e)
        }
      })
    }
  })
}

function work (msg, cb) {
  console.log(msg.content.toString())
  cb(true)
}

function closeOnErr (err) {
  if (!err) return false
  console.error('::: AMQP ERROR. AMQP CLOSING :::', err)
  amqpConn.close()
  return true
}

function publishMessage (message, routingKey = 'event.create') {
  publish('', routingKey, Buffer.from(message))
}

connect('event.create')
connect('event.modify')

module.exports = { publishMessage }
