/* eslint-disable camelcase */
/* eslint-disable no-console */
const { generateSlug } = require('random-word-slugs');
const UserState = require('../../db/models/UserState');
const UserDiscount = require('../../db/models/UserDiscount');
const { WhatsapSender } = require('../../providers/WhatsapSender');

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

function onShopifyOrderCreated(phoneNumber, userName, orderNumber) {
  return new Promise((resolve, reject) => {
    try {
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
        ).exec().then(resolve)
          .catch(reject);
      }, 3000);
    } catch (err) {
      reject(err);
    }
  });
}

function onShopifyFulfillmentCreated(phoneNumber, userName, trackingNumber, trackingUrl) {
  const fromNumber = `whatsapp:${phoneNumber}`;

  msgCtrl.sendMsg({
    fromNumber,
    msg: `Hello, ${userName}!\n\nWe're happy to tell you that your order has shipped!\n\nThis is your tracking number: ${trackingNumber}\n\nUse this link to track your package: ${trackingUrl}\n\n${backToMenu}\n${typeRecomendation}`,
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

async function onShopifyDiscountActivated(discountCodeFromHook) {
  return new Promise((resolve, reject) => {
    const code = discountCodeFromHook.toString();

    UserDiscount.find({
      notifiedCount: {
        $lt: 1,
      },
    }, (err, pairs) => {
      if (err) {
        console.log(err);
        return reject(err);
      }
      if (!pairs || !pairs.length) {
        console.log('discount not found');
        return resolve();
      }
      console.log(`\n\n\n\n++++++++++++++++\ndiscount code from hook: ${code}\n${console.log(typeof (code))}\n++++++++++++++++\n\n\n\n`);

      const foundPair = pairs.find((p) => p.discountCode === code);

      const discountSlug = generateSlug();
      if (!foundPair) {
        console.log('\n\n\n\n++++++++++++++++\npair not found\n++++++++++++++++\n\n\n\n');
        return resolve();
      }

      console.log(`\n\n\n\ndiscount code: ${foundPair.discountCode} is belonging to ${foundPair.phone}\n\n\n\n`);

      msgCtrl.sendMsg({
        fromNumber: foundPair.phone,
        msg: `Hello!!!\n\nCongratulations!\n\nYour referral was successful and you've earned 5% discount!!!\n\n\nYour referral code for discount: ${discountSlug}\n\n${backToMenu}`,
      });
      UserDiscount
        .create({
          discountCode: discountSlug,
          phone: foundPair.phone,
          notifiedCount: 0,
        })
        .then(() => {
          console.log('success!');
          UserDiscount
            .updateOne({
              discountCode: foundPair.discountCode,
              phone: foundPair.phone,
            }, {
              notifiedCount: 2,
            }, {}, (err2, upd) => {
              if (err2) {
                return reject(err2);
              }
              console.log(!!upd.ok);
              return resolve(pairs);
            });
        })
        .catch((error) => reject(error));
      return null;
    });
  });
}

module.exports = {
  onShopifyOrderCreated,
  onShopifyFulfillmentCreated,
  onShopifyDiscountActivated,
};
