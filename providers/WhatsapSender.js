/* eslint-disable no-console */
const twilio = require('twilio');

module.exports.WhatsapSender = ({ accountSid, authToken }) => {
  const client = twilio(accountSid, authToken);
  return {
    sendMsg: ({
      fromNumber,
      msg = 'msg is null',
      mediaUrl = null,
    }) => {
      if (fromNumber === 'whatsapp:+14155238886') {
        console.log(msg);
        return;
      }

      return mediaUrl ? client.messages
        .create({
          body: msg,
          from: 'whatsapp:+14155238886',
          to: fromNumber,
          mediaUrl,
        })
        .catch((err) => {
          // eslint-disable-next-line no-console
          console.log(err);
        })
        .done() : client.messages
        .create({
          body: msg,
          from: 'whatsapp:+14155238886',
          to: fromNumber,
        })
        .catch((err) => {
          // eslint-disable-next-line no-console
          console.log(err);
        })
        .done();
    },
  };
};
