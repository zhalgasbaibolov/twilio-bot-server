const accountSid = 'ACf385192ef965f7cbf43324fdd6951445';
const authToken = '134c971d23e3b6511bc357c1a71fb8ee';
const client = require('twilio')(accountSid, authToken);

client.messages
    .create({
        body: 'Hello! This is an editable text message. You are free to change it and write whatever you like.',
        from: 'whatsapp:+14155238886',
        to: 'whatsapp:+77078629827'
    })
    .then(message => console.log(message.sid))
    .catch(err => console.log(err))
    .done();