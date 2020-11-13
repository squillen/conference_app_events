const { Router } = require('express')
const notificationsCtrl = require('./notifications.controller.js')

const router = new Router()

router.route('/eventCreated').post(notificationsCtrl.eventCreated)
router.route('/eventUpdated').post(notificationsCtrl.eventUpdated)

module.exports = router
