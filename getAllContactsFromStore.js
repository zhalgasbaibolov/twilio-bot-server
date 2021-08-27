/* eslint-disable no-console */
const UserSetting = require('./db/models/UserSetting');

async function getAllContactsFromStore(req) {
  const contacts = await UserSetting.find({}).exec();
  console.log(req);
  return contacts;
}

module.exports = getAllContactsFromStore;
