var jwt = require('jsonwebtoken');


module.exports = (req, res, next) => {
    try {
        const token = req.headers['memberstack-jwt-token'];

        req.memberstack = jwt.decode(token);
        console.log(req.memberstack)
        const exp = req.memberstack.exp - (new Date().getTime() / 1000);
        if (exp < 0) {
            return res.sendStatus(401)
        }
        next()
    } catch (err) {
        console.log(err)
        res.sendStatus(401)
    }
}