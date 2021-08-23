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
          const { memberstackId } = sett;
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

              allOrders.forEach((cart) => {
                for (let i = 0; i < cart.billing_address.length; i += 1) {
                  const { phone } = cart.billing_address[i];
                  const userContact = phone;
                  UserContact
                    .findOne({
                      phone: userContact,
                    },
                    (err, result) => {
                      if (err) {
                        return console.log(err);
                      }
                      if (!result) {
                        UserContact
                          .create({
                            memberstackId,
                            phone,
                            contactType: 'fromShopifyDB',
                          });
                      } else {
                        console.log(`${phone} exists in DB`);
                      }
                      return result;
                    });

                  return;
                }
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
