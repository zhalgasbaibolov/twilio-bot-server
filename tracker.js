/* eslint-disable no-console */
const UserDiscount = require('./db/models/UserDiscount');
const { WhatsapSender } = require('./providers/WhatsapSender');

const msgCtrl = WhatsapSender({
  accountSid:
  'ACd40192a9c430fabab5e2e934c0f98fe4',
  authToken:
  'f76a5a44bbea4533fb7a17d0c9ff9954',
});
const {
  getAbandonedCart,
} = require('./cartAbandonment');

const storeAPIkey = 'a55e9f8e5d6feebd23752396acd80cc4';
const storePassword = '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';
const storeMyShopify = 'banarasi-outfit.myshopify.com';

const apiVersion = '2021-04';

module.exports = () => {
  setInterval(() => {
    getAbandonedCart(
      storeMyShopify,
      apiVersion,
      storeAPIkey,
      storePassword,
    )
      .then((response) => {
        if (!response) {
          return;
        }

        let allCarts = response.data && response.data.checkouts;
        if (!allCarts || !allCarts.length) {
          console.log('abandoned carts not found');
          return;
        }
        allCarts = allCarts.filter((cart) => cart.discount_codes
         && cart.discount_codes.length);
        UserDiscount.find({
          notifiedCount: {
            $lt: 1,
          },
        }, (err, pairs) => {
          if (!pairs || !pairs.length) {
            console.log('phone:discount pairs not found');
            return;
          }
          allCarts.filter((cart) => cart.discount_codes).forEach((cart) => {
            for (let i = 0; i < cart.discount_codes.length; i += 1) {
              const { code } = cart.discount_codes[i];
              const findedPair = pairs.find((p) => p.discountCode === code);
              if (!findedPair) return;
              console.log(`found pairs: ${findedPair.phone}: ${findedPair.discountCode}: ${findedPair.notifiedCount}`);

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
  }, 3000);
};
