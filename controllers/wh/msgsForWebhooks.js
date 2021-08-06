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
    msg: `Hello, ${userName}! Thank you for your shopping with us! Your order ${orderNumber} is being processed.`,
  });
};

module.exports = {
  shopifyOrderPaid,
  shopifyOrderCreated,
};
