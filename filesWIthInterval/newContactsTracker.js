/* eslint-disable camelcase */
/* eslint-disable no-console */
const UserContact = require('../db/models/UserContact');
const UserSetting = require('../db/models/UserSetting');

const getAllOrders = require('../getAllOrders');

// const intervalTime = 30000; // 1 hour

function newContactsTracker() {
  // setInterval(() => {
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
            allOrders = allOrders.filter((cart) => cart.shipping_address
         && cart.shipping_address.length);

            console.log(`\n\n++++++++++++\nall shipping addresses:${allOrders}\n+++++++++++++\n\n`);

            allOrders.forEach((cart) => {
              const { phone } = cart.shipping_address;
              console.log(phone);
              UserContact
                .findOne({
                  phone,
                },
                (err, result) => {
                  if (err) {
                    return console.log(err);
                  }
                  if (!result) {
                    UserContact
                      .create({
                        firstName: cart.shipping_address.first_name,
                        lastName: cart.shipping_address.last_name,
                        memberstackId,
                        phone: cart.shipping_address.phone.replace(/\D/g, ''),
                        country: cart.shipping_address.country,
                        contactType: 'fromShopifyDB',
                      });
                  } else {
                    console.log(`${phone} exists in DB`);
                  }
                  return result;
                });
            });
          }).catch((err) => {
            console.log(err);
          });
      });
    })
    .catch((err) => { console.log(err); });
  // }, intervalTime);
}

module.exports = {
  newContactsTracker,
};
