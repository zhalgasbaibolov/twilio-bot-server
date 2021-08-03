/* eslint-disable no-console */
const axios = require('axios');

const convertToDesktopFormat = (num) => ((num.startsWith('whatsapp:+')) ? `${num.susbstring(10)}@c.us` : num);

module.exports.DesktopSender = ({ url }) => ({
  sendMsg: ({
    fromNumber,
    msg = 'msg is null',
    mediaUrl = null,
  }) => {
    if (fromNumber === 'whatsapp:+14155238886') {
      console.log(msg);
      return null;
    }
    const from = convertToDesktopFormat(fromNumber);
    console.log(from, msg);
    const data = {
      message: msg,
      from,
    };
    if (mediaUrl) data.mediaUrl = mediaUrl;
    return axios
      .post(url, data, {
        headers: {
          'Content-Type': 'application/json',
        },
      })
      .catch((err) => {
        console.log(err);
      });
  },
  sendMediaList: async ({
    fromNumber,
    msg,
    mediaUrlList,
  }) => {
    if (fromNumber === 'whatsapp:+14155238886') {
      return null;
    }
    console.log(mediaUrlList);
    const from = convertToDesktopFormat(fromNumber);
    const data = {
      message: msg,
      from,
    };
    if (mediaUrlList) data.mediaUrlList = mediaUrlList;
    return axios
      .post(url, data, {
        headers: {
          'Content-Type': 'application/json',
        },
      })
      .catch((err) => {
        console.log(err);
      });
  },
});
