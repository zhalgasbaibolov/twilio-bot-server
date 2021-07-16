const UserDiscount = require('./db/models/UserDiscount');
const msgCtrl = require('./controllers/msg');
const {
  getAbandonedCart,
} = require('./cartAbandonment');

const storeAPIkey = 'a55e9f8e5d6feebd23752396acd80cc4';
const storePassword = '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';
const storeMyShopify = 'banarasi-outfit.myshopify.com';

const apiVersion = '2021-04';

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
      const allCarts = response.data.checkouts;
      if (!allCarts || !allCarts.length) {
        console.log('abandoned carts not found');
        return;
      }

      UserDiscount.find((err, pairs) => {
        if (!pairs || !pairs.length) {
          console.log('phone:discount pairs not found');
          return;
        }
        allCarts.forEach((cart) => {
          for (let i = 0; i < cart.discount_codes.length; i += 1) {
            const code = cart.discount_codes[i];
            const findedPair = pairs.find((p) => p.discountCode === code);
            if (!findedPair) return;
            msgCtrl.sendMsg({
              fromNumber: findedPair.phone,
              msg: `Please, complete your purchase!\n${cart.abandoned_checkout_url}`,
            });
            return;
          }
        });
        // eslint-disable-next-line consistent-return
        return pairs;
      });
    });
}, 3000);
