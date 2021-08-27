/* eslint-disable no-console */
const UserSetting = require('./db/models/UserSetting');

async function getAllContactsFromDB() {
  // const arr = [];
  const contacts = await UserSetting.find({}).exec();
  // arr.push(contacts.map((x) => x.phone));

  return contacts;
}

module.exports = getAllContactsFromDB;
