const express = require('express');

const router = express.Router();
const whCtrl = require('../controllers/wh');

router.all('/', whCtrl.handleMessage);

module.exports = router;
