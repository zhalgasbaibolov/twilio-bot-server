const twilio = require('twilio');
const authToken = require('../getAuthToken');

const sendMsg = function ({
  fromNumber,
  // name,
  msg = 'msg is null',
  mediaUrl = null,
}) {
  if (fromNumber === 'whatsapp:+14155238886') { return; }

  const accountSid = 'ACf385192ef965f7cbf43324fdd6951445';
  const client = twilio(accountSid, authToken);
  if (mediaUrl) {
    client.messages
      .create({
        body: msg,
        from: 'whatsapp:+14155238886',
        to: fromNumber,
        mediaUrl,
      })
      .catch((err) => console.log(err))
      .done();
  } else {
    client.messages
      .create({
        body: msg,
        from: 'whatsapp:+14155238886',
        to: fromNumber,
      })
      .catch((err) => console.log(err))
      .done();
  }
};
module.exports = {
  sendMsg,
};
