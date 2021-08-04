/* eslint-disable no-console */
/* eslint-disable no-unused-vars */
const express = require('express');

const router = express.Router();
const shopifyCtrl = require('../controllers/shopifywebhook')

router.all('/', async (req, res) => {
  await whCtrl.handleMessage(req, res);
});

router.all('/status', shopifyCtrl.handleStatus);

module.exports = router;
