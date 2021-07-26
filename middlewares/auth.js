const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  try {
    const token = req.headers['memberstack-jwt-token'];

    req.memberstack = jwt.decode(token);
    const exp = req.memberstack.exp - (new Date().getTime() / 1000);
    if (exp < 0) {
      return res.sendStatus(401);
    }
    return next();
  } catch (err) {
    return res.sendStatus(401);
  }
};
