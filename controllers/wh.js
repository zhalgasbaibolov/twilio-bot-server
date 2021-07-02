const getConnect = require('../db/mongo').getConnect;
const msgCtrl = require('../controllers/msg')
const ctrl = {
    msg(req, res) {
        try {
            const {
                From: fromNumber,
                Body: msg
            } = req.body;
            if (!fromNumber || !msg) {
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

    },
};

module.exports = ctrl;