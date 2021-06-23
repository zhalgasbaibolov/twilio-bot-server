const accountSid = 'ACf385192ef965f7cbf43324fdd6951445';
const authToken = require('./getAuthToken')
const client = require('twilio')(accountSid, authToken);

client.messages
    .create({
        body: 'скажи мне "тест успешно прошел"',
        from: 'whatsapp:+14155238886',
        to: 'whatsapp:+77084956880'
    })
    .then(message => console.log(message.sid))
    .catch(err => console.log(err))
    .done();