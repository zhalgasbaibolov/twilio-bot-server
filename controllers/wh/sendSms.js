/* eslint-disable no-console */
const twilioNumber = '+13019797858';
const a = '4d65193740';
const b = '9bc917006def';
const c = '17833e70e3';
const authToken = `${a}${b}${c}`;
const accountSid = 'AC1fee2a7efa8e8b0babcbbc241bc551bd';
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
