/* eslint-disable no-console */
const UserSetting = require('../db/models/UserSetting');
const TemporarySandboxUser = require('../db/models/TemporarySandboxUser');
const ApprovedSandboxUser = require('../db/models/ApprovedSandboxUsers');

const { WhatsapSender } = require('./WhatsapSender');
const { DesktopSender } = require('./DesktopSender');
const { ShopifyApi } = require('./shopifyApi');

const sandboxNumber = process.env.sandboxNumber || 'whatsapp:+13019797858';
const sandboxSid = process.env.sandboxSid || 'AC1fee2a7efa8e8b0babcbbc241bc551bd';
const sandboxToken = process.env.sandboxToken || '143e7ee056fcf7f3c33309a17dfba628';

const getProviders = async (req) => {
  const accountSid = req.body.AccountSid;
  const fromNumber = req.body.From;
  const msg = req.body.Body;

  console.log('wh controller', fromNumber, msg, req.body);
  if (fromNumber === 'whatsapp:+14155238886' || fromNumber === sandboxNumber) {
    return null;
  }

  let userSettings = null;
  let shopifyApi = null;
  let msgCtrl = null;
  let firstlyJoined = false;
  if (!accountSid) {
    msgCtrl = DesktopSender();
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
      firstlyJoined = true;
    }

    const temporarySandboxUser = await TemporarySandboxUser.findOne({ phone: fromNumber }).exec();
    if (!temporarySandboxUser) {
      msgCtrl.sendMsg({ fromNumber, msg: 'join to store before' });
      return null;
    }

    userSettings = await UserSetting.findById(temporarySandboxUser.settingsId);
    shopifyApi = ShopifyApi(userSettings.shopify);
    return {
      msgCtrl, shopifyApi, accountSid, userSettings, firstlyJoined,
    };
  }

  if (accountSid === sandboxSid) {
    msgCtrl = WhatsapSender({
      accountSid: sandboxSid,
      authToken: sandboxToken,
      senderNumber: sandboxNumber,
    });
    console.log('work with approved sandbox: ', fromNumber);
    if (msg.startsWith('join ')) {
      const joinWord = msg.substring(4).trim();
      userSettings = await UserSetting.findOne({ 'shopify.joinWord': joinWord }).exec();
      if (!userSettings) {
        console.log('not found userSettings with "shopify.externalUrl":', joinWord);
        msgCtrl.sendMsg({ fromNumber, msg: 'store not found' });
        return null;
      }

      await ApprovedSandboxUser.updateOne({ phone: fromNumber }, {
        settingsId: userSettings.id,
      }, {
        upsert: true,
      }).exec();
      firstlyJoined = true;
    }

    const sbxUser = await ApprovedSandboxUser.findOne({ phone: fromNumber }).exec();
    if (!sbxUser) {
      msgCtrl.sendMsg({ fromNumber, msg: 'join to store before' });
      return null;
    }

    userSettings = await UserSetting.findById(sbxUser.settingsId);
    userSettings.twilio.accountSid = accountSid;
    shopifyApi = ShopifyApi(userSettings.shopify);
    return {
      msgCtrl, shopifyApi, accountSid, userSettings, firstlyJoined,
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
