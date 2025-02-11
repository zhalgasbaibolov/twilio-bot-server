/* eslint-disable camelcase */
/* eslint-disable no-console */
const UserAbandonedDiscount = require('../db/models/UserAbandonedDiscount');
const UserSetting = require('../db/models/UserSetting');
const UserState = require('../db/models/UserState');
const { WhatsapSender } = require('../providers/WhatsapSender');

const getAllCheckouts = require('../getAllCheckouts');

const a = 'be22960c1';
const b = 'a28fe7d3aa41';
const c = '4fe4998e108';
const token = `${a}${b}${c}`;
const msgCtrl = WhatsapSender({
  accountSid:
  'AC09da4ce2aced21a4636bb3e288633b0d',
  authToken:
  token,
});
const backToMenu = '--------------\n\nType 0 to redirect to main menu';
const typeRecomendation = '(Please, type the number corresponding to your choice)';
function abandonedCartsTracker() {
  setInterval(() => {
    UserSetting.find({}).exec()
      .then((arr) => {
        if (!arr || !arr.length) return;
        arr.forEach((sett) => {
          if (!sett.shopify) {
            return;
          }
          const {
            storeMyShopify,
            apiVersion,
            storeAPIkey,
            storePassword,
          } = sett.shopify;
          getAllCheckouts(
            storeMyShopify,
            apiVersion,
            storeAPIkey,
            storePassword,
          )
            .then((response) => {
              let allCarts = response.data && response.data.checkouts;
              if (!allCarts || !allCarts.length) {
                // console.log('abandoned carts not found');
                return;
              }
              allCarts = allCarts.filter((cart) => cart.discount_codes
         && cart.discount_codes.length);
              // console.log(allCarts);
              UserAbandonedDiscount.find({
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
                    const foundPair = pairs.find((p) => p.discountCode === code);
                    if (!foundPair) {
                      return;
                    }
                    console.log('******************************');
                    console.log(`found pairs: ${foundPair.phone}: ${foundPair.discountCode}: ${foundPair.notifiedCount}`,
                      cart.abandoned_checkout_url);
                    console.log('******************************');
                    msgCtrl.sendMsg({
                      fromNumber: foundPair.phone,
                      msg: `Hi! We noticed that you left a few items in your shopping cart.\nPlease check it:\n${
                        cart.abandoned_checkout_url}`,
                    });
                    setTimeout(() => {
                      const txt = cart.line_items.map(({ title, variant_title, quantity }, idx) => `${idx + 1}. ${title}, ${variant_title}, quantity: ${quantity}.`).join('\n');
                      msgCtrl.sendMsg({
                        fromNumber: foundPair.phone,
                        msg: `Your cart is:\n${txt}\n\n\nWhat do you want to do next?\n1. Continue Shopping \n2. Proceed to payment \n3. Delete item\n${backToMenu}\n\n\n${typeRecomendation}`,
                      });
                      UserState.updateOne(
                        {
                          phone: foundPair.phone,
                        },
                        {
                          $set: {
                            last: 'cart',
                          },
                        },
                      ).exec();
                    }, 6000);
                    UserAbandonedDiscount.updateOne({
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
                    return;
                  }
                });
                // eslint-disable-next-line consistent-return
                return pairs;
              });
            }).catch((err) => {
              console.log(err);
            });
        });
      })
      .catch((err) => { console.log(err); });
  }, 20000); // 3 min
}
module.exports = {
  abandonedCartsTracker,
};
