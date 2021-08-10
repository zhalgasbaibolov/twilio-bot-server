/* eslint-disable camelcase */
/* eslint-disable no-console */
const { generateSlug } = require('random-word-slugs');
const UserState = require('../../db/models/UserState');
const UserDiscount = require('../../db/models/UserDiscount');
const { getProviders } = require('../../providers');

const backToMenu = '--------------\n0. Back to main menu';
const typeRecomendation = '(Please, type the number corresponding to your choice)';

async function shopifyOrderCreated(req, res, phoneNumber, userName, orderNumber) {
  res.send('OK');
  const getProviderResult = await getProviders(req);
  if (!getProviderResult) {
    return;
  }
  const { msgCtrl } = getProviderResult;
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
}

async function shopifyFulfillmentCreated(req, res, phoneNumber, userName, trackingNumber) {
  res.send('OK');
  const getProviderResult = await getProviders(req);
  if (!getProviderResult) {
    return;
  }
  const { msgCtrl } = getProviderResult;
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
}

async function shopifyDiscountActivated(req, res, discountCodeFromHook) {
  res.send('OK');
  const getProviderResult = await getProviders(req);
  if (!getProviderResult) {
    return;
  }
  const { msgCtrl } = getProviderResult;

  UserDiscount.find({
    notifiedCount: {
      $lt: 1,
    },
  }, (err, pairs) => {
    if (err) {
      console.log(err);
      return;
    }
    if (!pairs || !pairs.length) {
      console.log('discount not found');
      return;
    }
    const foundPair = pairs.find((p) => p.discountCode === discountCodeFromHook);
    const discountSlug = generateSlug();
    if (!foundPair) {
      return;
    }
    console.log(`\n\n\n\ndiscount code: ${foundPair.discountCode} is belonging to ${foundPair.phone}\n\n\n\n`);

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

    UserDiscount
      .updateOne({
        discountCode: foundPair.discountCode,
        phone: foundPair.phone,
      }, {
        notifiedCount: 2,
      }, {}, (err2, upd) => {
        if (err2) {
          console.log(err2);
        }
        if (upd.ok) console.log(upd.ok === 1);
      });

    // eslint-disable-next-line consistent-return
    return pairs;
  });
}

module.exports = {
  shopifyOrderCreated,
  shopifyFulfillmentCreated,
  shopifyDiscountActivated,
};
