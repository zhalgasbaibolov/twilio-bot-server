/* eslint-disable no-console */
const UserContacts = require('./db/models/UserContact');

function getAllContacts() {
  const contacts = UserContacts.find({}).exec();

  return contacts;
}

module.exports = getAllContacts;
