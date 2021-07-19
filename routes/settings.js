const express = require('express');

const router = express.Router();
const jwt = require('../middlewares/auth');

router.get('/', jwt, (req, res) => {
  res.send(req.headers);
});

module.exports = router;
