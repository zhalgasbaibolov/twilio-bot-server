/* eslint-disable camelcase */
/* eslint-disable no-console */
const UserContact = require('../db/models/UserContact');
const UserSetting = require('../db/models/UserSetting');

const getAllOrders = require('../getAllOrders');

const intervalTime = 3000000; // 1 hour

function newContactsTracker() {
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
          getAllOrders(
            storeMyShopify,
            apiVersion,
            storeAPIkey,
            storePassword,
          )
            .then((response) => {
              let allCarts = response.data && response.data.orders;
              if (!allCarts || !allCarts.length) {
                // console.log('abandoned carts not found');
                return;
              }
              allCarts = allCarts.filter((cart) => cart.billing_address
         && cart.billing_address.length);
              // console.log(allCarts);
              UserContact.find({
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
                  for (let i = 0; i < cart.billing_address.length; i += 1) {
                    const { phone } = cart.billing_address[i];
                    const foundPair = pairs.find((p) => p.phone === phone);
                    if (foundPair) {
                      return;
                    }

                    UserContact
                      .create({
                        phone,
                        contactType: 'fromShopifyDB',
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
  }, intervalTime);
}

module.exports = {
  newContactsTracker,
};
