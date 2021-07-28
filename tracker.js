/* eslint-disable no-console */
const UserDiscount = require('./db/models/UserDiscount');
const { WhatsapSender } = require('./providers/WhatsapSender');

const a = '370a717f';
const token = `${a}84299f15e25757c7e3e627fa`;
const msgCtrl = WhatsapSender({
  accountSid:
  'AC534b07c807465b936b2241514b536512',
  authToken:
  token,
});
const {
  getAbandonedCart,
} = require('./cartAbandonment');

const storeAPIkey = 'a55e9f8e5d6feebd23752396acd80cc4';
const storePassword = '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';
const storeMyShopify = 'banarasi-outfit.myshopify.com';

const apiVersion = '2021-04';

module.exports.tracker = () => {
  setInterval(() => {
    getAbandonedCart(
      storeMyShopify,
      apiVersion,
      storeAPIkey,
      storePassword,
    )
      .then((response) => {
        let allCarts = response.data && response.data.checkouts;
        if (!allCarts || !allCarts.length) {
          console.log('abandoned carts not found');
          return;
        }
        allCarts = allCarts.filter((cart) => cart.discount_codes
         && cart.discount_codes.length);
        // console.log(allCarts);
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
            console.log('phone:discount pairs not found');
            return;
          }
          allCarts.forEach((cart) => {
            for (let i = 0; i < cart.discount_codes.length; i += 1) {
              const { code } = cart.discount_codes[i];
              const findedPair = pairs.find((p) => p.discountCode === code);
              if (!findedPair) {
                return;
              }
              console.log('******************************');
              console.log(`found pairs: ${findedPair.phone}: ${findedPair.discountCode}: ${findedPair.notifiedCount}`,
                cart.abandoned_checkout_url);
              console.log('******************************');

              msgCtrl.sendMsg({
                fromNumber: findedPair.phone,
                msg:
                `Hi! Come back & finish your purchase! Here's the link:\n${
                  cart.abandoned_checkout_url}`,
              });

              UserDiscount.updateOne({
                discountCode: findedPair.discountCode,
                phone: findedPair.phone,
              }, {
                notifiedCount: 2,
              }, {}, (err2, upd) => {
                if (err2) {
                  return console.log(err2);
                }
                return console.log(upd);
              });
              return;
            }
          });
          // eslint-disable-next-line consistent-return
          return pairs;
        });
      }).catch((err) => {
        console.log(err);
      });
  }, 5000);
};
