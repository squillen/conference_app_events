const { Router } = require('express');
const usersCtrl = require('./events.controller');

const router = new Router();

router.route('/create').post(usersCtrl.createNewEvent);
router.route('/update').patch(usersCtrl.findAndUpdateEvent);
router.route('/findNearest').post(usersCtrl.findNearestEvents); // post because need location
router.route('/findByID').post(usersCtrl.findEventByID);
router.route('/findByName').post(usersCtrl.findEventByName);

module.exports = router;