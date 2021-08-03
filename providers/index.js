/* eslint-disable no-console */
const UserSetting = require('../db/models/UserSetting');
const TemporarySandboxUser = require('../db/models/TemporarySandboxUser');

const { WhatsapSender } = require('./WhatsapSender');
const { DesktopSender } = require('./DesktopSender');
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
  let shopifyApi = null;
  let msgCtrl = null;
  if (!accountSid) {
    msgCtrl = DesktopSender({ url: 'https://05b569af765f.ngrok.io/sendResponse' });
    console.log('accountSid not found in request', fromNumber, msg);
    if (msg.startsWith('join ')) {
      const shopExternalUrl = msg.substring(4).trim();
      console.log('msg from whatsap:', msg);
      userSettings = await UserSetting.findOne({ 'shopify.externalUrl': shopExternalUrl }).exec();
      if (!userSettings) {
        console.log('not found userSettings with "shopify.externalUrl":', shopExternalUrl);
        msgCtrl.sendMsg({ fromNumber, msg: 'store not found' });
        return null;
      }

      await TemporarySandboxUser.updateOne({ phone: fromNumber }, {
        settingsId: userSettings.id,
      }, {
        upsert: true,
      }).exec();
    }

    const temporarySandboxUser = await TemporarySandboxUser.findOne({ phone: fromNumber }).exec();
    if (!temporarySandboxUser) {
      msgCtrl.sendMsg({ fromNumber, msg: 'join to store before' });
      return null;
    }

    userSettings = await UserSetting.findById(temporarySandboxUser.settingsId);
    shopifyApi = ShopifyApi(userSettings.shopify);
    return {
      msgCtrl, shopifyApi, accountSid, userSettings,
    };
  }
  userSettings = await UserSetting.findOne({ 'twilio.accountSid': accountSid }).exec();
  if (!userSettings || !userSettings.twilio || !userSettings.shopify) {
    console.log('wrong user settings:', userSettings);
    return null;
  }

  msgCtrl = WhatsapSender(userSettings.twilio);
  shopifyApi = ShopifyApi(userSettings.shopify);
  return {
    msgCtrl, shopifyApi, accountSid, userSettings,
  };
};
module.exports = { getProviders };
