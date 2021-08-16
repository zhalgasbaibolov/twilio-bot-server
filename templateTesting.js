const accountSid = 'AC534b07c807465b936b2241514b536512';
const authToken = '370a717f84299f15e25757c7e3e627fa';
const client = require('twilio')(accountSid, authToken);

client.messages
  .create({
     from: 'whatsapp:+14155238886',
     body: 'Your babyshop code is 124ZGss',
     to: 'whatsapp:+77064050101'
   })
  .then(message => console.log(message.sid));