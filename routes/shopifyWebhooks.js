/* eslint-disable no-console */
/* eslint-disable no-unused-vars */
const express = require('express');

const router = express.Router();
const shopifyTest = require('../shopifyTest');

router.post('/webhooks/fulfillments/create', async (req, res) => {
  res.send('OK');
  shopifyTest();
  // const hmac = req.get('X-Shopify-Hmac-Sha256');
  // const body = await getRawBody(req);
});

router.post('/webhooks/fulfillments/create', async (req, res) => {
  res.send('OK');
  shopifyTest();
  // const hmac = req.get('X-Shopify-Hmac-Sha256');
  // const body = await getRawBody(req);
});

router.post('/webhooks/fulfillments/create', async (req, res) => {
  res.send('OK');
  shopifyTest();
  // const hmac = req.get('X-Shopify-Hmac-Sha256');
  // const body = await getRawBody(req);
});


module.exports = router;
