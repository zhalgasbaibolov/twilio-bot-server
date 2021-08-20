/* eslint-disable camelcase */
/* eslint-disable no-console */
const { getProviders } = require('../providers');
const UserContact = require('../db/models/UserContact');

const intervalTime = 3000000; // 1 hour

async function newContactsTracker(req, res) {
  res.send('OK');
  const getProviderResult = await getProviders(req);
  if (!getProviderResult) {
    return;
  }
  const { shopifyApi } = getProviderResult;
  setInterval(() => {
    shopifyApi.getAllOrders()
      .then((response) => {
        const phoneNumbers = response.data.orders
          .map((ord) => ord.phone);
        if (!phoneNumbers) {
          return;
        }
        for (let i = 0; i < phoneNumbers.length; i += 1) {
          UserContact.find({ phone: phoneNumbers[i] }, (err, pairs) => {
            if (err) {
              console.log(err);
              return;
            }
            if (!pairs || !pairs.length) {
              console.log('there is no phone number in orders.json');
            }

            const foundPair = pairs.find((p) => p.phone !== phoneNumbers[i]);
            UserContact
              .create({
                phone: foundPair.phone,
                contactType: 'fromShopifyDB',
              });
          });
        }
      })
      .catch((error) => {
        console.log(error);
      });
  }, intervalTime);
}

module.exports = {
  newContactsTracker,
};
