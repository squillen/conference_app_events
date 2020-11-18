const { publishMessage } = require('../../rabbitmq/send')

module.exports = class NotificationsController {
  static async eventCreated (req, res) {
    const { event } = req.body
    try {
      publishMessage(JSON.stringify(event), 'event.create')
      return res.json({ success: 'notified of event creation' })
    } catch (error) {
      console.error(`::: Failed to notify of ${event.name} creation :::`, error)
      return res.json({ error })
    }
  }

  static async eventUpdated (req, res) {
    const { event } = req.body
    try {
      publishMessage(JSON.stringify(event), 'event.modify')
      return res.json({ success: 'notified of event update' })
    } catch (error) {
      console.error(`::: Failed to notify of ${event.name} update :::`, error)
      return res.json({ error })
    }
  }
}
