/* eslint-disable no-console */
const UserSetting = require('./db/models/UserSetting');
const getAllCheckouts = require('./getAllCheckouts');

async function getAllContactsFromStore() {
  console.log('get contacts from store started !!!');
  let allCheckouts = [];
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
            allCheckouts = allCheckouts.push(allCarts);
            console.log(allCheckouts);
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
