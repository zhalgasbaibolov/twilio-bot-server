const getConnect = require('../db/mongo').getConnect;
const msgCtrl = require('../controllers/msg')

const msg = function(req, res) {
    console.log('wh controller', req)
    try {
        const fromNumber = req.body.From;
        const msg = req.body.Body;

        if (!fromNumber || !msg) {
            msgCtrl.sendMsg({
                fromNumber,
                msg: JSON.stringify(req.body)
            })
            return res.status(406).send({
                msg: 'wrong msg'
            })
        }
        const client = getConnect();
        client.connect(connecionError => {
            if (connecionError) {
                console.log(connecionError)
                return res.status(200).send(connecionError)
            }
            const db = client.db("test");
            const userStates = db.collection('userStates');
            userStates.findOne({
                    phone: fromNumber
                }).then(state => {
                    msgCtrl.sendMsg({
                        fromNumber,
                        msg: JSON.stringify(state)
                    })
                    return res.send(state || 'not found last active')

                })
                .catch(err => {
                    msgCtrl.sendMsg({
                        fromNumber,
                        msg: JSON.stringify(err)
                    })
                    return res.status(200).send(err)
                })
                .finally(() => {
                    client.close();
                })
        });
    } catch (err) {
        msgCtrl.sendMsg({
            fromNumber,
            msg: JSON.stringify(err)
        })
        return res.status(200).send(err)
    }

}

module.exports = {
    msg
};