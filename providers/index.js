/* eslint-disable no-console */
const UserSetting = require('../db/models/UserSettings');

const { WhatsapSender } = require('./WhatsapSender');

const { ShopifyApi } = require('./shopifyApi');

const getProviders = async (req) => {
  const accountSid = req.body.AccountSid;
  const fromNumber = req.body.From;
  const msg = req.body.Body;
  console.log('wh controller', fromNumber, msg, req.body);
  if (fromNumber === 'whatsapp:+14155238886') {
    return null;
  }

  let userSettings = null;
  try {
    userSettings = await UserSetting.find({}).exec();
    userSettings = userSettings.find(
      (sett) => sett && sett.twilio && sett.twilio.accountSid === accountSid,
    );
    if (!userSettings || !userSettings.twilio || !userSettings.shopify) {
      console.log('wrong user settings:', userSettings);
      return null;
    }
  } catch (getSettigsErr) {
    console.log(getSettigsErr);
    return null;
  }
  const msgCtrl = WhatsapSender(userSettings.twilio);
  const shopifyApi = ShopifyApi(userSettings.shopify);
  return { msgCtrl, shopifyApi, accountSid };
};
module.exports = { getProviders };
