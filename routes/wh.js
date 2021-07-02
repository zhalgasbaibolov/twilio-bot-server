var express = require('express');
var router = express.Router();
const whCtrl = require('../controllers/wh')
router.all('/', function(req, res, next) {
    whCtrl.msg(req, res)
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