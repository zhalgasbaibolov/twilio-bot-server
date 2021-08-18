const express = require('express');

const router = express.Router();
const whCtrl = require('../controllers/wh');

router.all('/', async (req, res) => {
  await whCtrl.handleMessage(req, res);
});

router.all('/status', whCtrl.handleStatus);

module.exports = router;
