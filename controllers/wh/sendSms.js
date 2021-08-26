/* eslint-disable no-console */
const twilioNumber = '+19403146668';
const a = 'be22960c1';
const b = 'a28fe7d3aa41';
const c = '4fe4998e108';
const authToken = `${a}${b}${c}`;
const accountSid = 'AC09da4ce2aced21a4636bb3e288633b0d';
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
