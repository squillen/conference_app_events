const { Router } = require('express')
const eventsCtrl = require('./events.controller')

const router = new Router()

router.route('/create').post(eventsCtrl.createNewEvent)
router.route('/update').patch(eventsCtrl.findAndUpdateEvent)
router.route('/updateSponsors').patch(eventsCtrl.updateEventSponsors)
router.route('/findNearest').post(eventsCtrl.findNearestEvents) // post because need location
router.route('/findByID').post(eventsCtrl.findEventByID)
router.route('/findByName').post(eventsCtrl.findEventByName)
router.route('/expectedRevenue').post(eventsCtrl.findExpectedEventRevenue)

module.exports = router
