/* eslint-disable no-console */
const UserSetting = require('./db/models/UserSetting');
const getAllCheckouts = require('./getAllCheckouts');

async function getAllContactsFromStore() {
  await UserSetting.find({}).exec()
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
            const allCarts = response.data && response.data.checkouts;
            if (!allCarts || !allCarts.length) {
            // console.log('abandoned carts not found');

            }
          }).catch((err) => {
            console.log(err);
          });
      });
    })
    .catch((err) => { console.log(err); });

//   console.log(req);
//   return contacts;
}

module.exports = getAllContactsFromStore;
