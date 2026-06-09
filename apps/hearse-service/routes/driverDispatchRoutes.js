const express = require('express');
const router = express.Router();
const {
  assignVehicleDispatch,
} = require('../src/controllers/assignDriverDispstch');

router.post('/dispatch', assignVehicleDispatch);

module.exports = router;
