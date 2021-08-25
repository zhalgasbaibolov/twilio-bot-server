/* eslint-disable no-console */
const twilioNumber = '+19286156092';
const a = 'abdc276b';
const b = 'ca5995f447';
const c = 'd05df1e9610526';
const authToken = `${a}${b}${c}`;
const accountSid = 'AC4352390b9be632aabb39a3b9282dc338';
const client = require('twilio')(accountSid, authToken);

async function sendSms(phoneNumber, message) {
  try {
    console.log(`\n\n+-+-+-+-+-+-+-+\naccepted values: 1. phoneNumber - ${phoneNumber}, 2. message - ${message}\n+-+-+-+-+-+-+-\n\n`);
    const response = await client.messages.create({
      body: message,
      from: twilioNumber,
      to: phoneNumber,
    });
    return response;
  } catch (e) {
    console.log(e, 'ERROR in SENDSMS');
    return e;
  }
}

module.exports = sendSms;
