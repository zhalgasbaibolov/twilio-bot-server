/* eslint-disable no-console */
const UserContacts = require('./db/models/UserContact');

function getAllContacts() {
  const variants = UserContacts.find({}).exec();
  const arr = variants.map((x) => x.phone);

  return arr;
}

module.exports = getAllContacts;
