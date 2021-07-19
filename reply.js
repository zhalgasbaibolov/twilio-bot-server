const accountSid = 'ACf385192ef965f7cbf43324fdd6951445';
const twilio = require('twilio');
const authToken = require('./getAuthToken');

const client = twilio(accountSid, authToken);

client.messages
  .create({
    body: 'Hello! This is an editable text message. You are free to change it and write whatever you like.',
    from: 'whatsapp:+14155238886',
    to: 'whatsapp:+77078629827',
  })
  .then((message) => console.log(message.sid))
  .catch((err) => console.log(err))
  .done();
