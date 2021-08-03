/* eslint-disable no-console */
const UserSetting = require('../db/models/UserSetting');
const TemporarySandboxUser = require('../db/models/TemporarySandboxUser');

const { WhatsapSender } = require('./WhatsapSender');
const { ShopifyApi } = require('./shopifyApi');

const getProviders = async (req) => {
  const accountSid = req.body.AccountSid;
  const fromNumber = req.body.From;
  const msg = req.body.Body;

  console.log('wh controller', fromNumber, msg, req.body);
  let userSettings = null;

  if (!accountSid) {
    if (msg.startsWith('join ')) {
      const shopExternalUrl = msg.substring(4).trim();
      userSettings = await UserSetting.findOne({ 'shopify.externalUrl': shopExternalUrl }).exec();
      if (!userSettings) return null;
    } else {
      const sandboxUser = await TemporarySandboxUser.updateOne({ phone: fromNumber }, {
        memberstackId: userSettings.memberstackId,
      }, {
        upsert: true,
      }).exec();
      console.log('\n\n\nsandBoxUserUpdating INFO', sandboxUser, '\n\n\n');
      return null;
    }
  }
  if (fromNumber === 'whatsapp:+14155238886') {
    return null;
  }

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
  return {
    msgCtrl, shopifyApi, accountSid, userSettings,
  };
};
module.exports = { getProviders };
