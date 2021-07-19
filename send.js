const twilio = require('twilio');

const accountSid = 'ACf385192ef965f7cbf43324fdd6951445';
const authToken = require('./getAuthToken');

const client = twilio(accountSid, authToken);

client.messages
  .create({
    mediaUrl: ['https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSDH16dhANTYJuWZDp1IIbUL6OHyW_tizbW1A&usqp=CAU'],
    body: 'test 3',
    from: 'whatsapp:+14155238886',
    to: 'whatsapp:+77013909616',
  })
  .then((message) => console.log(message.sid))
  .catch((err) => console.log(err))
  .done();
