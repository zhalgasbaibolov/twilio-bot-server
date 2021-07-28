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
        return null;
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
    sendMediaList: ({
      fromNumber,
      mediaUrlList,
    }) => {
      if (fromNumber === 'whatsapp:+14155238886') {
        return null;
      }

      return client.messages
        .create({
          from: 'whatsapp:+14155238886',
          to: fromNumber,
          mediaUrl: mediaUrlList,
        })
        .catch((err) => {
          // eslint-disable-next-line no-console
          console.log(err);
        });
    },
  };
};
