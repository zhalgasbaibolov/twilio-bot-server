/* eslint-disable camelcase */
/* eslint-disable no-console */
const { WhatsapSender } = require('./providers/WhatsapSender');
// const { handleMessage } = require('./controllers/wh');

const a = '370a717f';
const token = `${a}84299f15e25757c7e3e627fa`;
const msgCtrl = WhatsapSender({
  accountSid:
  'AC534b07c807465b936b2241514b536512',
  authToken:
  token,
});

const shopifyTest = () => {
    msgCtrl.sendMsg({
      fromNumber: 'whatsapp:+77075002029',
      msg: 'Hi! We noticed that you left a few items in your shopping cart.',
    })
};

module.exports = shopifyTest;
