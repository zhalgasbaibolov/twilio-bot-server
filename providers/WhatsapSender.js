/* eslint-disable no-console */
const twilio = require('twilio');

module.exports.WhatsapSender = ({ accountSid, authToken }) => ({
  sendMsg: ({
    fromNumber,
    msg = 'msg is null',
    mediaUrl = null,
  }) => {
    if (fromNumber === 'whatsapp:+14155238886') {
      console.log(msg);
      return null;
    }
    const client = twilio(accountSid, authToken);
    console.log(fromNumber, msg);
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
  sendMediaList: async ({
    fromNumber,
    msg,
    mediaUrlList,
  }) => {
    if (fromNumber === 'whatsapp:+14155238886') {
      return null;
    }
    console.log(mediaUrlList);
    const client = twilio(accountSid, authToken);

    return client.messages
      .create({
        from: 'whatsapp:+14155238886',
        body: msg,
        to: fromNumber,
        mediaUrl: mediaUrlList,
      }).catch((err) => {
        // eslint-disable-next-line no-console
        console.log(err, mediaUrlList);
      });
  },
});
