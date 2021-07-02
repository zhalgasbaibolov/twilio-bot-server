var express = require('express');
var router = express.Router();
const jwt = require('../middlewares/auth')
    
router.get('/', jwt, function(req, res, next) {
    res.send(req.headers);
});

module.exports = router;