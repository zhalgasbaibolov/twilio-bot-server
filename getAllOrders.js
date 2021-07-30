/* eslint-disable no-console */
const axios = require('axios');

async function getAllOrders(
  storeMyShopify,
  apiVersion,
  storeAPIkey,
  storePassword,
  enterDate = new Date(),
) {
  enterDate.setDate(enterDate.getDate() - 5);
  let newDate = enterDate.toISOString();
  newDate = newDate.substring(0, newDate.length - 5);

  const urlLastOrders = `https://${storeAPIkey}:${storePassword}@${storeMyShopify}/admin/api/${apiVersion}/orders.json?updated_at_min=${newDate}`;

  return axios
    .get(urlLastOrders, {
      headers: {
        'Content-Type': 'application/json',
      },
    })
    .then((response) => {
      console.log(response);
      return response;
    })
    .catch((error) => {
      // handle error
      console.log('error', error);
      return false;
    });
}

exports.getAllOrders = getAllOrders;
module.exports = exports;
