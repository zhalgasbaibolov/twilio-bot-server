const express = require('express');

const router = express.Router();
const whCtrl = require('../controllers/wh');

router.all('/', (req, res) => {
  whCtrl.handleMessage(req, res);
});

module.exports = router;
