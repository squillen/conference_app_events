// var amqp = require('amqplib/callback_api');
// var amqpConn = null;

// function connect() {
//   amqp.connect('amqp://localhost', function(err, conn) {
//     if (err) {
//       console.error("::: AMQP ERROR :::", err.message);
//       return setTimeout(connect, 1000); // try again
//     }
//     conn.on("error", function(err) {
//       if (err.message !== "Connection closing") {
//         console.error("::: AMQP CONN ERROR :::", err.message);
//       }
//     });
//     conn.on("close", function() {
//       console.error("::: AMQP RECONNECTING :::");
//       return setTimeout(connect, 1000); // try again
//     });

//     console.log("::: AMQP CONNECTED! :::");
//     amqpConn = conn;

//     whenConnected();
//   });
// }

// function whenConnected() {
//   startPublisher();
//   startWorker();
// }

// var pubChannel = null;
// var offlinePubQueue = [];
// function startPublisher() {
//   amqpConn.createConfirmChannel(function(err, ch) {
//     if (closeOnErr(err)) return;
//     ch.on("error", function(err) {
//       console.error("::: AMQP CHANNEL ERROR :::", err.message);
//     });
//     ch.on("close", function() {
//       console.log("::: AMQP CHANNEL CLOSED :::");
//     });

//     pubChannel = ch;
//     while (true) {
//       var m = offlinePubQueue.shift();
//       if (!m) break;
//       publish(m[0], m[1], m[2]);
//     }
//   });
// }

// // method to publish a message, will queue messages internally if the connection is down and resend later
// function publish(exchange, routingKey, content) {
//   try {
//     pubChannel.publish(exchange, routingKey, content, { persistent: true },
//       function(err, ok) {
//         if (err) {
//           console.error("::: AMQP PUBLISH ERROR :::", err);
//           offlinePubQueue.push([exchange, routingKey, content]);
//           pubChannel.connection.close();
//         }
//       });
//   } catch (e) {
//     console.error("::: AMQP PUBLISH ERROR :::", e.message);
//     offlinePubQueue.push([exchange, routingKey, content]);
//   }
// }

// // A worker that acknowledges messages only if processed successfully
// function startWorker() {
//   amqpConn.createChannel(function(err, ch) {
//     if (closeOnErr(err)) return;
//     ch.on("error", function(err) {
//       console.error("::: AMQP ERROR ::: channel error", err.message);
//     });
//     ch.on("close", function() {
//       console.log("::: AMQP ERROR ::: channel closed");
//     });
//     ch.prefetch(10);
//     ch.assertQueue("events", { durable: true }, function(err, res) {
//       if (closeOnErr(err)) return;
//       ch.consume("events", processMsg, { noAck: false });
//       console.log("Worker is started");
//     });

//     function processMsg(msg) {
//       work(msg, function(ok) {
//         try {
//           if (ok)
//             ch.ack(msg);
//           else
//             ch.reject(msg, true);
//         } catch (e) {
//           closeOnErr(e);
//         }
//       });
//     }
//   });
// }

// function work(msg, cb) {
//   console.log("Got msg", msg.content.toString());
//   cb(true);
// }

// function closeOnErr(err) {
//   if (!err) return false;
//   console.error("::: AMQP ERROR. AMQP CLOSING :::", err);
//   amqpConn.close();
//   return true;
// }

// export function publishMessage(message, routingKey = 'events') {
//   publish("", routingKey, Buffer.from(message));
// }

// connect();