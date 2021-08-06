/* eslint-disable no-console */
/* eslint-disable no-unused-vars */
const express = require('express');

const router = express.Router();
const shopifyTest = require('../shopifyTest');
const {
  shopifyOrderCreated,
} = require('../controllers/wh/msgsForWebhooks');

router.post('/webhooks/fulfillments/create', async (req, res) => {
  res.send('OK');
  shopifyTest();
  // const hmac = req.get('X-Shopify-Hmac-Sha256');
  // const body = await getRawBody(req);
});

router.post('/webhooks/orders/create', async (req, res) => {
  res.send('OK');
  const phoneNumber = req.body.customer.phone;
  const userName = req.body.customer.first_name;
  const orderNumber = req.body.order_number;

  if (!phoneNumber) {
    console.log(`there is no phone number in order ${orderNumber}!`);
  }

  shopifyOrderCreated(phoneNumber, userName, orderNumber);

  // const hmac = req.get('X-Shopify-Hmac-Sha256');
  // const body = await getRawBody(req);
});

module.exports = router;
