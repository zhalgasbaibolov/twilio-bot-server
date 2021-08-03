/* eslint-disable camelcase */
/* eslint-disable no-console */
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
  getAbandonedCart,
} = require('./cartAbandonment');

const backToMenu = '--------------\n\nType 0 to redirect to main menu';

module.exports.trackerSelf = () => {
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
                console.log('checkouts not found');
                return;
              }
              allCarts = allCarts.filter((cart) => cart.abandoned_checkout_url
         && cart.abandoned_checkout_url.length);
              if (!allCarts || !allCarts.length) {
                console.log('abandoned checkouts not found');
                return;
              }
              // console.log(allCarts);
              allCarts.forEach((cart) => {
                for (let i = 0; i < cart.abandoned_checkout_url.length; i += 1) {
                  const abandonedCheckoutUrl = cart.abandoned_checkout_url[i];
                  const phoneNumber = `whatsapp:${cart.customer.phone}`;
                  console.log(phoneNumber);
                  msgCtrl.sendMsg({
                    fromNumber: phoneNumber,
                    msg: `Hi! We noticed that you left a few items in your shopping cart.\nPlease check it:\n${
                      abandonedCheckoutUrl}`,
                  });
                  setTimeout(() => {
                    const txt = cart.line_items.map(({ title, variant_title, quantity }, idx) => `${idx + 1}. ${title}, ${variant_title}, quantity: ${quantity}.`).join('\n');
                    msgCtrl.sendMsg({
                      fromNumber: phoneNumber,
                      msg: `Your cart is:\n${txt}\n${backToMenu}`,
                    });
                  }, 4000);
                  return;
                }
              });
              // eslint-disable-next-line consistent-return
            }).catch((err) => {
              console.log(err);
            });
        });
      })
      .catch((err) => { console.log(err); });
  }, 5000);
};
