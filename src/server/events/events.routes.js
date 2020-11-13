const { Router } = require('express');
const eventsCtrl = require('./events.controller');

const router = new Router();

router.route('/create').post(eventsCtrl.createNewEvent);
router.route('/update').patch(eventsCtrl.findAndUpdateEvent);
router.route('/findNearest').post(eventsCtrl.findNearestEvents); // post because need location
router.route('/findByID').post(eventsCtrl.findEventByID);
router.route('/findByName').post(eventsCtrl.findEventByName);

module.exports = router;