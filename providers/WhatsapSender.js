/* eslint-disable no-console */
const twilio = require('twilio');

module.exports.WhatsapSender = ({ accountSid, authToken, senderNumber = 'whatsapp:+14155238886' }) => ({
  sendMsg: ({
    fromNumber,
    msg = 'msg is null',
    mediaUrl = null,
  }) => {
    if (fromNumber === senderNumber) {
      console.log(msg);
      return null;
    }
    const client = twilio(accountSid, authToken);
    console.log(fromNumber, msg);
    return mediaUrl ? client.messages
      .create({
        body: msg,
        from: senderNumber,
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
        from: senderNumber,
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
    if (fromNumber === senderNumber) {
      return null;
    }
    console.log(mediaUrlList);
    const client = twilio(accountSid, authToken);

    return client.messages
      .create({
        from: senderNumber,
        body: msg,
        to: fromNumber,
        mediaUrl: mediaUrlList,
      }).catch((err) => {
        // eslint-disable-next-line no-console
        console.log(err, mediaUrlList);
      });
  },
});
