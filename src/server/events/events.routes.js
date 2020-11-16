const { Router } = require('express')
const eventsCtrl = require('./events.controller')

const router = new Router()

router.route('/create').post(eventsCtrl.createNewEvent)
router.route('/updateSponsors').patch(eventsCtrl.updateEventSponsors)
router.route('/findNearest').get(eventsCtrl.findNearestEvents)
router.route('/expectedRevenue/:id').get(eventsCtrl.findExpectedEventRevenue)
router.route('/update').patch(eventsCtrl.findAndUpdateEvent)
router.route('/findByID').post(eventsCtrl.findEventByID)
router.route('/findByName').post(eventsCtrl.findEventByName)

module.exports = router
