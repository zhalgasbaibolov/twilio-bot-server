/* eslint-disable camelcase */
/* eslint-disable no-console */
const UserContact = require('../db/models/UserContact');
const UserSetting = require('../db/models/UserSetting');

const getAllOrders = require('../getAllOrders');

const intervalTime = 30000; // 1 hour

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
              let allOrders = response.data && response.data.orders;
              if (!allOrders || !allOrders.length) {
                // console.log('abandoned carts not found');
                return;
              }
              allOrders = allOrders.filter((cart) => cart.billing_address
         && cart.billing_address.length);
              // console.log(allOrders);
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
                allOrders.forEach((cart) => {
                  for (let i = 0; i < cart.billing_address.length; i += 1) {
                    const { phone } = cart.billing_address[i];
                    if (phone !== pairs.phone) {
                      UserContact
                        .create({
                          phone,
                          contactType: 'fromShopifyDB',
                        });
                      return;
                    }

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
