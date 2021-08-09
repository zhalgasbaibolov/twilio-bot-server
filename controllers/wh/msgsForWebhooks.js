/* eslint-disable camelcase */
/* eslint-disable no-console */
const { WhatsapSender } = require('../../providers/WhatsapSender');

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
  setTimeout(() => {
    msgCtrl.sendMsg({
      fromNumber: `whatsapp:${phoneNumber}`,
      msg: 'We\'d love to hear your review! Got a minute to share it with us?\n1. Yes\n2. No',
    });
  }, 3000);
};

const shopifyFulfillmentCreated = (phoneNumber, userName, trackingNumber) => {
  msgCtrl.sendMsg({
    fromNumber: `whatsapp:${phoneNumber}`,
    msg: `Hello, ${userName}!\n\nWe're happy to tell you that your order has shipped!\n\nThis is your tracking number: ${trackingNumber}\n\nUse this link to track your package: https://t.17track.net/en#nums=${trackingNumber}`,
  });
};

module.exports = {
  shopifyOrderCreated,
  shopifyFulfillmentCreated,
};
