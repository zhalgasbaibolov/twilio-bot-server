/* eslint-disable no-console */
const express = require('express');

const router = express.Router();
const {
  onShopifyOrderCreated,
  onShopifyFulfillmentCreated,
  onShopifyDiscountActivated,
} = require('../controllers/wh/msgsForWebhooks');

router.post('/webhooks/fulfillments/create', async (req, res) => {
  res.send('OK');


  const data = req.body.destination.flat();
  const allData = req.body.flat();
  const phoneNumber = req.body.destination.flat().map((ord) => ord.phone);
  const userName = req.body.destination.first_name;
  const trackingNumber = req.body.tracking_number;
  const trackingUrl = req.body.tracking_url;

  console.log(`\n\n\n\n++++++++++++++++\nthis is your destination data:\n${allData}\n++++++++++++++++\n\n\n\n`);
  console.log(`\n\n\n\n++++++++++++++++\nthis is your ALL data:\n${data}\n++++++++++++++++\n\n\n\n`);
  

  if (!phoneNumber) {
    console.log('\n\n\n\n++++++++++++++++\nthere is no phone number in fulfillment order!\n++++++++++++++++\n\n\n\n');
    console.log(`${phoneNumber}\n\n\n\n\n\n`);
  }

  onShopifyFulfillmentCreated(phoneNumber, userName, trackingNumber, trackingUrl);
});

router.post('/webhooks/orders/create', async (req, res) => {
  res.send('OK');

  const phoneNumber = req.body.customer.phone;
  const userName = req.body.customer.first_name;
  const orderNumber = req.body.order_number;
  const discountCodeFromHook = req.body.discount_codes
    .flat().map((ord) => ord.code);
  // const orderStatusUrl = req.body.order_status_url

  if (!phoneNumber) {
    console.log(`there is no phone number in order ${orderNumber}!`);
  }

  onShopifyOrderCreated(phoneNumber, userName, orderNumber).then(() => {
    onShopifyDiscountActivated(discountCodeFromHook);
  }).catch((error) => {
    // eslint-disable-next-line no-console
    console.log('@@@@@@@@@@ERROR at activatedDiscount:   ', error);
    return false;
  });
});

module.exports = router;
