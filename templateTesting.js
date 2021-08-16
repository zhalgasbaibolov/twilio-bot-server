const accountSid = 'AC534b07c807465b936b2241514b536512';
const authToken = 'ad8c24ce8ee4d4be7cf28dac8a5d6e1e';
const client = require('twilio')(accountSid, authToken);

client.messages
  .create({
     from: 'whatsapp:+14155238886',
     body: 'Your babyshop code is 124ZGss',
     to: 'whatsapp:+77075002029'
   })
  .then(message => console.log(message.sid));