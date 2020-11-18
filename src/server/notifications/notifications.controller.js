const { publishMessage } = require('../../rabbitmq/send')
const CircuitBreaker = require('opossum')

const options = {
  timeout: 3000, // If our function takes longer than 3 seconds, trigger a failure
  errorThresholdPercentage: 50, // When 50% of requests fail, trip the circuit
  resetTimeout: 5000, // After 30 seconds, try again.
}

async function handleEvent (event, type) {
  try {
    const success = await publishMessage(JSON.stringify(event), type)
    return { success }
  } catch (error) {
    return { error }
  }
}

module.exports = class NotificationsController {
  static async eventCreated (req, res) {
    const { event } = req.body
    const breaker = new CircuitBreaker(handleEvent, options)
    try {
      const result = await breaker.fire(event, 'event.create')
      console.log('result:::', result)
      return res.json({ success: 'notified of event creation' })
    } catch (error) {
      console.error(`::: Failed to notify of ${event.name} creation :::`, error)
      return res.json({ error })
    }
  }

  static async eventUpdated (req, res) {
    const { event } = req.body
    const breaker = new CircuitBreaker(handleEvent, options)
    try {
      const result = await breaker.fire(event, 'event.update')
      console.log('result:::', result)
      return res.json({ success: 'notified of event creation' })
    } catch (error) {
      console.error(`::: Failed to notify of ${event.name} creation :::`, error)
      return res.json({ error })
    }
  }
}
