/* eslint-disable camelcase */
/* eslint-disable no-console */
const { generateSlug } = require('random-word-slugs');
const { WhatsapSender } = require('../../providers/WhatsapSender');
const UserState = require('../../db/models/UserState');
const UserDiscount = require('../../db/models/UserDiscount');

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
  const fromNumber = `whatsapp:${phoneNumber}`;
  msgCtrl.sendMsg({
    fromNumber,
    msg: `Hello, ${userName}!\nThank you for your shopping with us!\nYour order #${orderNumber} has been received.\n\nWe'll send tracking information when order ships.`,
  });
  setTimeout(() => {
    msgCtrl.sendMsg({
      fromNumber,
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
  const fromNumber = `whatsapp:${phoneNumber}`;
  msgCtrl.sendMsg({
    fromNumber,
    msg: `Hello, ${userName}!\n\nWe're happy to tell you that your order has shipped!\n\nThis is your tracking number: ${trackingNumber}\n\nUse this link to track your package: https://t.17track.net/en#nums=${trackingNumber}\n\n${backToMenu}\n${typeRecomendation}`,
  });
  setTimeout(() => {
    msgCtrl.sendMsg({
      fromNumber,
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

const shopifyDiscountActivated = (discountCodes) => {
  const foundDiscountCodes = discountCodes;

  UserDiscount.find({
    notifiedCount: {
      $lt: 1,
    },
  }, (err, pairs) => {
    if (err) {
      console.log(err);
      return;
    }
    if (!pairs) {
      console.log('discount not found');
      return;
    }
    foundDiscountCodes.forEach((cart) => {
      for (let i = 0; i < cart.discount_codes.length; i += 1) {
        const { code } = cart.discount_codes[i];
        const foundPair = pairs.find((p) => p.discountCode === code);
        const discountSlug = generateSlug();
        if (!foundPair) {
          return;
        }
        console.log(`\n\n\n\ndiscount code: ${foundPair.discountCode}\n\n\n\n`);

        msgCtrl.sendMsg({
          fromNumber: foundPair.phone,
          msg: `Hello!!!  Congratulations!  Your referral was successful and you've earned 5% discount!!! Your referral code for discount: ${discountSlug}\n\n${backToMenu}`,
        });

        UserDiscount
          .create({
            discountCode: discountSlug,
            phone: foundPair.phone,
            notifiedCount: 0,
          })
          .then(() => {
            console.log('success!');
          })
          .catch((error) => {
            console.log(error);
          });
      }
    });
    // eslint-disable-next-line consistent-return
    return pairs;
  });
};

module.exports = {
  shopifyOrderCreated,
  shopifyFulfillmentCreated,
  shopifyDiscountActivated,
};
