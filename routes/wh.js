var express = require('express');
var router = express.Router();

router.all('/', function(req, res, next) {
    console.log(req.body)
    const fromNumber = req.body.From;
    if (fromNumber == 'whatsapp:+14155238886') {
        return res.send('OK')
    }
    const name = req.body.ProfileName;
    const msg = req.body.Body;
    sendSalem(fromNumber, name, msg)
    const runMongoCommand = require('../db/mongo')
    runMongoCommand(insertDocuments, [req.body])
    res.send("OK");
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

function sendSalem(fromNumber, name, msg) {
    const accountSid = 'ACf385192ef965f7cbf43324fdd6951445';
    const authToken = require('../getAuthToken')
    const client = require('twilio')(accountSid, authToken);

    client.messages
        .create({
            body: msg == '1' ? 'shop' : msg == '2' ? 'purchase' : `Salem, ${name}! I'm glad to read your "${msg}"`,
            from: 'whatsapp:+14155238886',
            to: fromNumber
        })
        .then(message => console.log(message.sid))
        .catch(err => console.log(err))
        .done();
}