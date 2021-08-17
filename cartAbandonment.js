const axios = require('axios');

async function getAbandonedCart(
  storeMyShopify,
  apiVersion,
  storeAPIkey,
  storePassword,
) {
  console.log('\n*****+++++++*******+++++++\n\n\ngetabandoned cart 1\n\n\n*****+++++++*******+++++++\n');

  const urlCheckouts = `https://${storeAPIkey}:${storePassword}@${storeMyShopify}/admin/api/${apiVersion}/checkouts.json`;

  console.log('\n*****+++++++*******+++++++\n\n\ngetabandoned cart 2\n\n\n*****+++++++*******+++++++\n');

  return axios
    .get(urlCheckouts,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      })
    .then((response) => response)
    .catch((error) => {
      // eslint-disable-next-line no-console
      console.log('@@@@@@@@@@ERROR at getAbandonedCart:   ', error);
      return false;
    });
}

exports.getAbandonedCart = getAbandonedCart;
module.exports = exports;
