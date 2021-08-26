/* eslint-disable no-console */
const UserContacts = require('./db/models/UserContact');

async function getAllContacts() {
  const arr = [];
  const contacts = await UserContacts.find({}).exec();
  arr.push(contacts.map((x) => x.phone));

  return arr;
}

module.exports = getAllContacts;
