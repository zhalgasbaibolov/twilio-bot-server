/* eslint-disable camelcase */
/* eslint-disable no-console */
const { WhatsapSender } = require('../../providers/WhatsapSender');
const whCtrl = require('./index');

const a = '370a717f';
const token = `${a}84299f15e25757c7e3e627fa`;
const msgCtrl = WhatsapSender({
  accountSid:
  'AC534b07c807465b936b2241514b536512',
  authToken:
  token,
});

const shopifyOrderCreated = (phoneNumber, userName, orderNumber) => {
  msgCtrl.sendMsg({
    fromNumber: `whatsapp:${phoneNumber}`,
    msg: `Hello, ${userName}!\nThank you for your shopping with us!\nYour order #${orderNumber} has been received.\n\nWe'll send tracking information when order ships.`,
  });
};

const shopifyFulfillmentCreated = (phoneNumber, userName, trackingNumber) => {
  msgCtrl.sendMsg({
    fromNumber: `whatsapp:${phoneNumber}`,
    msg: `Hello, ${userName}!\nYour order has shipped.\nThis is your tracking number: ${trackingNumber}\n\nUse this link to track your package: https://t.17track.net/en#nums=${trackingNumber}`,
  });
};

module.exports = {
  shopifyOrderCreated,
  shopifyFulfillmentCreated,
};
