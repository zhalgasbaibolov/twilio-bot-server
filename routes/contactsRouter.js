/* eslint-disable no-console */
const express = require('express');

const router = express.Router();

const UserContacts = require('../db/models/UserContact');

router.get('/contacts', (req, res) => {
  const contacts = UserContacts.find({}).exec().then((arr) => {
    arr.forEach((element) => {
      const groupContacts = element.phone;
      console.log('success contacts');
      return groupContacts;
    });
  });

  res.json({ status: 'success', results: contacts });
});

module.exports = router;
