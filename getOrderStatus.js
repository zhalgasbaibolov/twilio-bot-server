"use strict";
const axios = require("axios");



async function getOrderStatus(

    //???? what variables i need to use
    storeMyShopify,
    apiVersion,
    storeAPIkey,
    storePassword,
    newDate
) {
    var enterDate = new Date();
    enterDate.setDate(enterDate.getDate() - 5); // subtract 5 days from now
    var newDate = enterDate.toISOString(); // shopify api need: updated_at_min=2005-07-31T15:57:11-04:00 format

    const url_lastOrders = `https://${storeAPIkey}:${storePassword}@${storeMyShopify}/admin/api/${apiVersion}/orders.json?updated_at_min=${newDate}`;

    return axios
        .get(url_lastOrders, {
            headers: {
                "Content-Type": "application/json",
            },
        })
        .then(function (response) {
            console.log(response);
            return response;
        })
        .catch(function (error) {
            // handle error
            console.log("error", error);
            return false;
        });
}

exports.getOrderStatus = getOrderStatus;
module.exports = exports;