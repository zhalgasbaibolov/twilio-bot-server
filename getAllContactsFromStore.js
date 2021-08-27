/* eslint-disable no-console */
const UserContacts = require('./db/models/UserContact');

async function getAllContactsFromStore(req) {
  const contacts = await UserContacts.find({}).exec();
  console.log(req);
  return contacts;
}

module.exports = getAllContactsFromStore;
