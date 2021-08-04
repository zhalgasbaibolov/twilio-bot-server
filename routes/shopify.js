/* eslint-disable no-console */
/* eslint-disable no-unused-vars */
const express = require('express');

const router = express.Router();
const shopifyTest = require('../shopifyTest');

router.post('/webhooks/fulfillments/create', async (req, res) => {
  res.status(200);
  shopifyTest();
  // console.log('🎉 We got a fulfillment create!');
  // const hmac = req.get('X-Shopify-Hmac-Sha256');
  // const body = await getRawBody(req);
});

module.exports = router;
