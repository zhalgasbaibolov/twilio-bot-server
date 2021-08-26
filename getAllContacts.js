/* eslint-disable no-console */
const UserContacts = require('./db/models/UserContact');

function getAllContacts() {
  const arr = [];
  const variants = UserContacts.find({}).exec();
  arr.push(variants.map((x) => x.phone));

  return arr;
}

module.exports = getAllContacts;
