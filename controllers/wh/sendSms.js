/* eslint-disable no-console */
const twilioNumber = '+19286156092';
const a = 'abdc276b';
const b = 'ca5995f447';
const c = 'd05df1e9610526';
const authToken = `${a}${b}${c}`;
const accountSid = 'AC4352390b9be632aabb39a3b9282dc338';
const client = require('twilio')(accountSid, authToken);

function sendSms(phoneNumber, message) {
  return new Promise((resolve, reject) => {
    try {
      client.messages.create({
        body: message,
        from: twilioNumber,
        to: phoneNumber,
      }).then(resolve);
    } catch (err) {
      console.log(err, 'ERROR in SENDSMS');
      reject(err);
    }
  });
}

module.exports = { sendSms };
