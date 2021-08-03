/* eslint-disable no-console */
const UserSetting = require('../db/models/UserSetting');
const TemporarySandboxUser = require('../db/models/TemporarySandboxUser');

const { WhatsapSender } = require('./WhatsapSender');
const { ShopifyApi } = require('./shopifyApi');

const getProviders = async (req, res) => {
  const accountSid = req.body.AccountSid;
  const fromNumber = req.body.From;
  const msg = req.body.Body;

  console.log('wh controller', fromNumber, msg, req.body);
  let userSettings = null;
  let sandboxUser = null;

  if (!accountSid) {
    console.log('accountSid not found in request', fromNumber, msg);
    if (msg.startsWith('join ')) {
      const shopExternalUrl = msg.substring(4).trim();
      console.log('msg from whatsap:', msg);
      userSettings = await UserSetting.findOne({ 'shopify.externalUrl': shopExternalUrl }).exec();
      if (!userSettings) {
        console.log('not found userSettings with "shopify.externalUrl":', shopExternalUrl);
        res.status(200).send({ action: 'send', text: 'wrong join link' });
        return null;
      }

      sandboxUser = await TemporarySandboxUser.updateOne({ phone: fromNumber }, {
        settingsId: userSettings.id,
      }, {
        upsert: true,
      }).exec();
    }
    console.log('sandboxUser:', sandboxUser);
    if (!sandboxUser) {
      sandboxUser = await TemporarySandboxUser.findOne({ phone: fromNumber }).exec();
      if (!sandboxUser) {
        res.status(200).send({ action: 'send', text: 'join to store before' });
        return null;
      }
    }

    const temporarySandboxUser = await TemporarySandboxUser.findOne({ phone: fromNumber }).exec();
    if (!temporarySandboxUser) {
      console.log('if (!temporarySandboxUser) return null');
      res.status(200).send({ action: 'send', text: 'wrong join link or store not found' });
      return null;
    }
    userSettings = await UserSetting.findById(temporarySandboxUser.settingsId);
  }
  if (fromNumber === 'whatsapp:+14155238886') {
    res.send('ok1');
    return null;
  }

  try {
    userSettings = await UserSetting.find({}).exec();
    userSettings = userSettings.find(
      (sett) => sett && sett.twilio && sett.twilio.accountSid === accountSid,
    );
    if (!userSettings || !userSettings.twilio || !userSettings.shopify) {
      console.log('wrong user settings:', userSettings);
      res.send('ok2');
      return null;
    }
  } catch (getSettigsErr) {
    console.log(getSettigsErr);
    res.send('ok3');
    return null;
  }
  const msgCtrl = WhatsapSender(userSettings.twilio);
  const shopifyApi = ShopifyApi(userSettings.shopify);
  return {
    msgCtrl, shopifyApi, accountSid, userSettings,
  };
};
module.exports = { getProviders };
