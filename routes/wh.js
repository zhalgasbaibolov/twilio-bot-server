var express = require('express');
const getConnect = require('../db/mongo').getConnect;
var router = express.Router();

router.all('/', function(req, res, next) {
    console.log(req.body)
    const fromNumber = req.body.From;
    try {
        const name = req.body.ProfileName;
        let msg = req.body.Body;
        msg = msg.toLowerCase()
        if (msg == 'main')
            sendMsg(fromNumber, name, `Main menu\n1) Product menu \n2) Orders menu`)
        else if (msg == '1')
            sendMsg(fromNumber, name, `Product menu\n Choose catalog \n 1.1) laptops \n1.2) phones`)
        else if (msg == '1.1')
            sendMsg(fromNumber, name, `Catalog: laptops\n1.1.1) HP \n1.1.2) MackPRO`)
        else if (msg == 'hp' || msg == 'mackpro')
            sendMsg(fromNumber, name, `Color:\n1) black \n2) white`)
        else if (msg == 'black' || msg == 'white')
            sendMsg(fromNumber, name, `Purchase: thank you for your purchase :)`)
        else if (msg == '2')
            sendMsg(fromNumber, name, `Order menu\n2.1) Check status \n2) Delete order`)
        else if (msg == '2.1')
            sendMsg(fromNumber, name, `Order status: delivering`)
        else if (msg == '2.2')
            sendMsg(fromNumber, name, `Order deleting: are you sure you want to delete your order ?[delete/no]`)
        else if ('delete')
            sendMsg(fromNumber, name, `Order deleted. Type 'main' to redirect to Main menu`)
        else if (msg == 'no')
            sendMsg(fromNumber, name, `Order deleting canceled.Type 'main' to redirect to Main menu`)
        else
            sendMsg(fromNumber, name, `please, resend command or type 'main' to redirect to Main menu`)
        const runMongoCommand = require('../db/mongo')
        runMongoCommand(insertDocuments, [req.body])
        res.send("OK");
    } catch (err) {
        console.log(err)
        res.send({
            err: err
        })
    }
});

module.exports = router;

function insertDocuments(db, arr, callback) {
    // Get the documents collection
    const collection = db.collection('tests');
    // Insert some documents
    collection.insertMany(arr, function(err, result) {
        if (err) {
            console.log(err)
        }
        callback();
    });
};

function sendMsg(fromNumber, name, msg) {
    const accountSid = 'ACf385192ef965f7cbf43324fdd6951445';
    const authToken = require('../getAuthToken')
    const client = require('twilio')(accountSid, authToken);

    client.messages
        .create({
            body: msg,
            from: 'whatsapp:+14155238886',
            to: fromNumber
        })
        .then(message => console.log(message.sid))
        .catch(err => console.log(err))
        .done();
}