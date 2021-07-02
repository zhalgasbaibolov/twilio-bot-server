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
                return res.status(400).send({
                    msg: 'wrong msg'
                })
            }
            msgCtrl.sendMsg({
                fromNumber,
                msg
            })
        } catch (err) {
            console.log(err)
        }
        return res.sendStatus(200)
        const client = getConnect();
        client.connect(connecionError => {
            if (connecionError) {
                console.log(connecionError)
                return res.sendStatus(500);
            }
            const db = client.db("test");
            const userStates = db.collection('userStates');
            userStates.findOne({
                phone: fromNumber
            }).then(state => {
                console.log(state)
            })
            callback(db, arr, function() {
                client.close();
            });
        });
    },
};

module.exports = ctrl;