/* eslint-disable camelcase */
/* eslint-disable no-console */
const { generateSlug } = require('random-word-slugs');
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

const dayInMilliseconds = 1000 * 60 * 15; // every 15  minutes
const backToMenu = '--------------\n\n0. Back to main menu';

module.exports.trackerDiscount = () => {
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
              // console.log(allOrders);
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
                allOrders.forEach((cart) => {
                  for (let i = 0; i < cart.discount_codes.length; i += 1) {
                    const phoneNumber = cart.discount_codes.filter((x) => x.code).map(({ code }) => `whatsapp:+${code}`);
                    const discountSlug = generateSlug();
                    if (!phoneNumber) {
                      return;
                    }
                    console.log('******************************');
                    console.log(`discount code: ${phoneNumber.code}`);
                    console.log('******************************');

                    msgCtrl.sendMsg({
                      fromNumber: phoneNumber,
                      msg: `Congratulations!  Your referral was successful and you earned 5% discount!!! Your referral code for discount - ${discountSlug}${backToMenu}`,
                    });

                    UserDiscount
                      .create({
                        discountCode: discountSlug,
                        phone: phoneNumber,
                        notifiedCount: 0,
                      })
                      .then(() => {
                        console.log('success!')
                      })
                      .catch((error) => {
                        console.log(error);
                      });
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
  }, dayInMilliseconds);
};
