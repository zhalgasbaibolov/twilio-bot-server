const getConnect = require('../db/mongo').getConnect;
const msgCtrl = require('../controllers/msg')

const msg = function(req, res) {
    try {
        const fromNumber = req.body.From || req.body['From'];
        if ('whatsapp:+14155238886' === fromNumber)
            return res.sendStatus(200)
        const msg = req.body.Body || req.body['Body'];
        console.log('wh controller', fromNumber, msg, req.body)

        // if (!fromNumber || !msg) {
        //     msgCtrl.sendMsg({
        //         fromNumber,
        //         msg: JSON.stringify({
        //             fromNumber,
        //             msg
        //         })
        //     })
        //     console.log('return 406 from wh ctrl')
        //     return res.status(406).send({
        //         msg: 'wrong msg'
        //     })
        // }
        const client = getConnect();
        client.connect(connecionError => {
            if (connecionError) {
                console.log(connecionError)
                msgCtrl.sendMsg({
                    fromNumber,
                    msg: 'connecionError'
                })
                return res.status(200).send(connecionError)
            }
            const db = client.db("test");
            const userStates = db.collection('userStates');
            userStates.findOne({
                    phone: fromNumber
                }).then(state => {
                    if (!state) {
                        userStates.insertOne({
                            phone: fromNumber,
                            last: 'main'
                        }).then(inserted => {
                            msgCtrl.sendMsg({
                                fromNumber,
                                msg: JSON.stringify(inserted)
                            })
                        })
                    } else {
                        msgCtrl.sendMsg({
                            fromNumber,
                            msg: JSON.stringify(state)
                        })
                    }
                })
                .catch(err => {
                    msgCtrl.sendMsg({
                        fromNumber,
                        msg: 'err1'
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
            msg: 'JSON.stringify(err)'
        })
        return res.status(200).send(err)
    }

}

module.exports = {
    msg
};