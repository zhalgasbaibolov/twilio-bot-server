const accountSid = 'ACf385192ef965f7cbf43324fdd6951445';
const authToken = require('./getAuthToken')
const client = require('twilio')(accountSid, authToken);

client.messages
    .create({
        body: 'go test me',
        from: 'whatsapp:+14155238886',
        to: 'whatsapp:+77761250628'
    })
    .then(message => console.log(message.sid))
    .catch(err => console.log(err))
    .done();