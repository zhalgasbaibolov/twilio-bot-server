/* eslint-disable camelcase */
/* eslint-disable no-console */
const UserDiscount = require('./db/models/UserDiscount');
const UserSetting = require('./db/models/UserSettings');
const { WhatsapSender } = require('./providers/WhatsapSender');
// const { handleMessage } = require('./controllers/wh');

const a = '370a717f';
const token = `${a}84299f15e25757c7e3e627fa`;
const msgCtrl = WhatsapSender({
  accountSid:
  'AC534b07c807465b936b2241514b536512',
  authToken:
  token,
});
const {
  getActivatedDiscounts,
} = require('./getActivatedDiscounts');

module.exports.trackerDiscount = () => {
    const dayInMilliseconds = 1000 * 60 * 60 * 24;
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
          getActivatedDiscounts(
            storeMyShopify,
            apiVersion,
            storeAPIkey,
            storePassword,
          )
            .then((response) => {
              let allOrders = response.data && response.data.orders;
              if (!allOrders || !allOrders.length) {
                console.log('orders not found');
                return;
              }
              allOrders = allOrders.filter((cart) => cart.discount_codes
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
                  console.log('discount not found');
                  return;
                }
                allCarts.forEach((cart) => {
                  for (let i = 0; i < cart.discount_codes.length; i += 1) {
                    const phoneNumbers = discount_codes.filter((x) => x.code).map(({ code }) => `whatsapp:+${code}`)
                    if (!findedPair) {
                      return;
                    }

                    msgCtrl.sendMsg({
                      fromNumber: phoneNumbers,
                      msg: `Congratulations!  You\'ve earned 5% discount!!! `,
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
  }, dayInMilliseconds); //24 hours
};
