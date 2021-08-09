/* eslint-disable camelcase */
/* eslint-disable no-console */
const { WhatsapSender } = require('../../providers/WhatsapSender');
const UserState = require('../../db/models/UserState');

const a = '370a717f';
const token = `${a}84299f15e25757c7e3e627fa`;
const msgCtrl = WhatsapSender({
  accountSid:
  'AC534b07c807465b936b2241514b536512',
  authToken:
  token,
});

const backToMenu = '--------------\n0. Back to main menu';
const typeRecomendation = '(Please, type the number corresponding to your choice)';

const shopifyOrderCreated = (phoneNumber, userName, orderNumber) => {
  const fromNumber = phoneNumber;
  msgCtrl.sendMsg({
    fromNumber: `whatsapp:${fromNumber}`,
    msg: `Hello, ${userName}!\nThank you for your shopping with us!\nYour order #${orderNumber} has been received.\n\nWe'll send tracking information when order ships.`,
  });
  setTimeout(() => {
    msgCtrl.sendMsg({
      fromNumber: `whatsapp:${fromNumber}`,
      msg: `We'd love to hear your review! Got a minute to share it with us?\n1. Yes\n2. No\n\n${backToMenu}\n${typeRecomendation}`,
    });
    UserState.updateOne(
      {
        phone: fromNumber,
      },
      {
        $set: {
          last: 'marketing',
        },
      },
    ).exec();
  }, 3000);
};

const shopifyFulfillmentCreated = (phoneNumber, userName, trackingNumber) => {
  const fromNumber = phoneNumber;
  msgCtrl.sendMsg({
    fromNumber: `whatsapp:${phoneNumber}`,
    msg: `Hello, ${userName}!\n\nWe're happy to tell you that your order has shipped!\n\nThis is your tracking number: ${trackingNumber}\n\nUse this link to track your package: https://t.17track.net/en#nums=${trackingNumber}\n\n${backToMenu}\n${typeRecomendation}`,
  });
  setTimeout(() => {
    msgCtrl.sendMsg({
      fromNumber: `whatsapp:${fromNumber}`,
      msg: `We'd love to hear your review! Got a minute to share it with us?\n1. Yes\n2. No\n\n${backToMenu}\n${typeRecomendation}`,
    });
    UserState.updateOne(
      {
        phone: fromNumber,
      },
      {
        $set: {
          last: 'marketing',
        },
      },
    ).exec();
  }, 3000);
};

module.exports = {
  shopifyOrderCreated,
  shopifyFulfillmentCreated,
};
