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

  const phoneNumber = req.body.map((ord) => ord.destination)
  .flat().map((ord) => ord.phone);
  const userName = req.body.map((ord) => ord.destination)
  .flat().map((ord) => ord.first_name);
  const trackingNumber = req.body.tracking_number;
  const trackingUrl = req.body.tracking_url;

  if (!phoneNumber) {
    console.log('\n\n\n\n\************************\nthere is no phone number in fulfillment order!\n*****************************\n\n\n\n');
    console.log(`${phoneNumber}\n\n\n\n\n\n`);
  }

  onShopifyFulfillmentCreated(phoneNumber, userName, trackingNumber, trackingUrl);
});

router.post('/webhooks/orders/create', async (req, res) => {
  res.send('OK');

  const phoneNumber = req.body.customer.phone;
  const userName = req.body.customer.first_name;
  const orderNumber = req.body.order_number;
  const discountCodeFromHook = req.body.map((ord) => ord.discount_codes)
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
