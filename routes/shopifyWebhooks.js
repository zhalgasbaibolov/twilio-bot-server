/* eslint-disable no-console */
const express = require('express');

const router = express.Router();
const {
  shopifyOrderCreated,
  shopifyFulfillmentCreated,
} = require('../controllers/wh/msgsForWebhooks');

router.post('/webhooks/fulfillments/create', async (req, res) => {
  res.send('OK');

  const phoneNumber = req.body.destination.phone;
  const userName = req.body.destination.first_name;
  const trackingNumber = req.body.tracking_number;

  if (!phoneNumber) {
    console.log('there is no phone number in fulfillment order!');
  }

  shopifyFulfillmentCreated(phoneNumber, userName, trackingNumber);
});

router.post('/webhooks/orders/create', async (req, res) => {
  res.send('OK');

  const phoneNumber = req.body.customer.phone;
  // const userName = req.body.customer.first_name;
  const orderNumber = req.body.order_number;
  const orderStatusUrl = req.body.order_status_url

  if (!phoneNumber) {
    console.log(`there is no phone number in order ${orderNumber}!`);
  }

  shopifyOrderCreated(phoneNumber, orderStatusUrl, orderNumber);
});

module.exports = router;
