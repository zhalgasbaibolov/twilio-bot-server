/* eslint-disable no-console */
const UserContacts = require('./db/models/UserContact');

async function getAllContacts() {
  const contacts = await UserContacts.find({}).exec();

  return contacts;
}

module.exports = getAllContacts;
