/* eslint-disable no-console */
const UserContacts = require('./db/models/UserContact');

function getAllContacts() {
  const arr = [];
  const contacts = UserContacts.find({}).exec();
  console.log(typeof (contacts));
  console.log(contacts);
  arr.push(contacts.map((x) => x.phone));

  return arr;
}

module.exports = getAllContacts;
