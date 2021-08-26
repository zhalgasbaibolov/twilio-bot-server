/* eslint-disable no-console */
const express = require('express');

const router = express.Router();
const {
  sendSms,
} = require('../controllers/wh/sendSms');

router.post('/sms', async (req, res) => {
  console.log('\n\nsmsRouter started!\n\n');
  res.send('OK');
  const phoneNumber = req.body.to;
  const { message } = req.body;

  if (!phoneNumber || !message) {
    console.log('\n\n\n\n++++++++++++++++\nthere is no phone number OR message!\n++++++++++++++++\n\n\n\n');
  }
  console.log(`\n\n-*-*-*-*-*-*\nsmsRouter.js\nsending sms to: ${phoneNumber} with message: ${message}\n-*-*-*-*-*-*-\n\n`);

  sendSms(phoneNumber, message).then(() => console.log('successfully sent SMS!')).catch((error) => {
    console.log('error at sending SMS', error);
    return false;
  });
});

module.exports = router;
