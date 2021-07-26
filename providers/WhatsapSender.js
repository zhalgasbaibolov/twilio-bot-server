const twilio = require('twilio');

module.exports.WhatsapSender = function WhatsapSender(settings) {
  const client = twilio(settings.accountSid, settings.authToken);
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

      if (mediaUrl) {
        client.messages
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
          .done();
      } else {
        client.messages
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
      }
    },
  };
};
