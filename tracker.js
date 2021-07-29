/* eslint-disable no-console */
const UserDiscount = require('./db/models/UserDiscount');
const UserSetting = require('./db/models/UserSettings');
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

module.exports.tracker = () => {
  setInterval(() => {
    UserSetting.find({}).exec()
      .then((arr) => {
        if (!arr || !arr.length) return;
        arr.forEach((sett) => {
          const {
            storeMyShopify,
            apiVersion,
            storeAPIkey,
            storePassword,
          } = sett.shopify;
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
                    setTimeout(() => {
                      const txt = cart.line_items
                          .map(
                            ({title, variant_title, quantity}, idx) => `${idx + 1}. ${title}, ${variant_title} quantity: ${quantity}.`,
                          ) 
                          .join('\n');
                      msgCtrl.sendMsg({
                        fromNumber,
                        msg: `Your cart is:\n${txt}`,
                      });
                        setTimeout(() => {
                          msgCtrl.sendMsg({
                            fromNumber,
                            msg: `Is there anything else that you want?\n1. Catalog\n2. Customer Support\n3. Order Status\n4. Abandoned cart\n5. Loyalty program (organic marketing)`,
                          });
                      }, 8000);
                    }, 3000)
                    
                    UserDiscount.updateOne({
                      discountCode: findedPair.discountCode,
                      phone: findedPair.phone,
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
  }, 5000);
};
