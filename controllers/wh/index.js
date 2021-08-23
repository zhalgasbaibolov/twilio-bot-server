/* eslint-disable no-console */
const axios = require('axios');
const { generateSlug } = require('random-word-slugs');

const UserState = require('../../db/models/UserState');
const UserDiscount = require('../../db/models/UserDiscount');
const UserAbandonedDiscount = require('../../db/models/UserAbandonedDiscount');
const UserReview = require('../../db/models/UserReview');
const UserContact = require('../../db/models/UserContact');
const CountryCode = require('../../db/models/CountryCode');

const { getProviders } = require('../../providers');

async function handleMessage(req, res) {
  res.send('OK');
  const getProviderResult = await getProviders(req);
  if (!getProviderResult) {
    return;
  }
  const { msgCtrl, shopifyApi, userSettings } = getProviderResult;
  const { accountSid } = userSettings.twilio;
  const { memberstackId } = userSettings;

  const fromNumber = req.body.From;
  const msg = req.body.Body;
  const userContact = fromNumber.slice(9);
  const firstName = req.body.ProfileName;

  const errorHandler = (err) => {
    // eslint-disable-next-line no-console
    console.log(err);
    msgCtrl.sendMsg({
      fromNumber,
      msg: JSON.stringify(err),
    });
  };
  const backToMenu = '--------------\n0. Back to main menu';
  const typeRecomendation = '(Please, type the number corresponding to your choice)';

  function createNewDialog() {
    UserContact
      .findOne({
        phone: userContact,
      },
      (err, result) => {
        if (err) {
          return console.log(err);
        }
        if (!result) {
          UserContact
            .create({
              memberstackId,
              firstName,
              phone: userContact,
              contactType: 'fromWhatsappDB',
            }).then(() => {
              UserState
                .updateOne({
                  phone: fromNumber,
                },
                { last: 'demoMain' },
                { upsert: true })
                .then(() => {
                  /* eslint-disable no-use-before-define */
                  sendDiscount();
                }).catch(errorHandler);
            }).catch(errorHandler);
        } else {
          UserState
            .updateOne({
              phone: fromNumber,
            },
            { last: 'demoMain' },
            { upsert: true })
            .then(() => {
              /* eslint-disable no-use-before-define */
              sendDiscount();
            }).catch(errorHandler);
        }
        return result;
      });
  }
  function sendMainMenu(ms = 0, firstTime = false) {
    const firstWord = firstTime ? 'Hello! What do you want?' : 'What would you like to do now?';
    const viewCart = firstTime ? '' : '5. View cart';
    setTimeout(() => {
      msgCtrl.sendMsg({
        fromNumber,
        msg: `${firstWord}\n1. Catalogue\n2. Order Status\n3. Get discount (Abandoned cart)\n4. Loyalty program (organic marketing)\n${viewCart}\n\n\n${typeRecomendation}`,
      });
      UserState.updateOne(
        {
          phone: fromNumber,
        },
        {
          $set: {
            last: 'main',
          },
        },
      ).exec();
    }, ms);
  }
  function sendCatalog() {
    shopifyApi.retireveCollections().then((
      response,
    ) => {
      const collections = `Select Collection:\n${
        response.collections.edges
          .map((val, idx) => `${idx + 1}. ${val.node.title}`)
          .join('\n')}\n${backToMenu}\n\n\n${typeRecomendation}`;
      msgCtrl.sendMsg({
        fromNumber,
        msg: collections,
      });
      UserState.updateOne(
        {
          phone: fromNumber,
        },
        {
          last: 'catalog',
          catalogs: response.collections.edges,
        },
      ).exec();
    }).catch(errorHandler);
  }
  function resendCommand() {
    msgCtrl.sendMsg({
      fromNumber,
      msg: 'Please, send right command\nOR type 0 to redirect to main menu',
    });
  }
  function createCheckoutWithDiscount(state) {
    const checkoutUrl = state.storedLineItems.map(({ variantId, quantity }) => `${variantId.slice(29)}:${quantity}`).join(',');

    const discountSlug = generateSlug();
    shopifyApi.shopifyDiscountCreate(
      discountSlug,
    )
      .then((response) => {
        const { code } = response.data.discount_code;
        console.log(`\n\n+++++++++++\n${code}\n+++++++++++\n\n`);
        UserDiscount
          .create({
            discountCode: discountSlug,
            phone: fromNumber,
            notifiedCount: 0,
          });
        const newDiscountForCheckout = discountSlug;
        const txt = `Congratulations!\nYour order is almost created.\nPlease, open this url to proceed to make payments!\n http://${userSettings.shopify.externalUrl}/cart/${checkoutUrl}?discount=${newDiscountForCheckout}`;
        msgCtrl.sendMsg({
          fromNumber,
          msg: txt,
        });
        sendMainMenu(5000);
        UserState.updateOne({
          phone: fromNumber,
        },
        {
          $set: {
            storedLineItems: [],
          },
        }).exec();
      }).catch(errorHandler);
  }
  // const getSupport = () => {
  //   msgCtrl.sendMsg({
  //     fromNumber,
  //     msg: `Hi there! Welcome to Customer Support Service!\nTo start
  // conversation please type your
  //  message\n(the Team usually replies in a few minutes)\n${backToMenu}
  // \n\n\n${typeRecomendation}`,
  //   });
  //   UserState.updateOne(
  //     {
  //       phone: fromNumber,
  //     },
  //     {
  //       $set: {
  //         last: 'support',
  //       },
  //     },
  //   ).exec();
  // };

  const getOrderStatus = () => {
    msgCtrl.sendMsg({
      fromNumber,
      msg: `Type your tracking number OR email.\n${backToMenu}\n\n\n${typeRecomendation}`,
    });
    const country = [
      {
        code: 'AF', map: '🇦🇫', phoneCode: 93, value: 'Afghanistan',
      },
      {
        code: 'AL', map: '🇦🇱', phoneCode: 355, value: 'Albania',
      },
      {
        code: 'DZ', map: '🇩🇿', phoneCode: 213, value: 'Algeria',
      },
      {
        code: 'AS', map: '🇦🇸', phoneCode: 1684, value: 'American Samoa',
      },
      {
        code: 'AD', map: '🇦🇩', phoneCode: 376, value: 'Andorra',
      },
      {
        code: 'AO', map: '🇦🇴', phoneCode: 244, value: 'Angola',
      },
      {
        code: 'AI', map: '🇦🇮', phoneCode: 1264, value: 'Anguilla',
      },
      {
        code: 'AQ', map: '🇦🇶', phoneCode: 0, value: 'Antarctica',
      },
      {
        code: 'AR', map: '🇦🇷', phoneCode: 54, value: 'Argentina',
      },
      {
        code: 'AM', map: '🇦🇲', phoneCode: 374, value: 'Armenia',
      },
      {
        code: 'AW', map: '🇦🇼', phoneCode: 297, value: 'Aruba',
      },
      {
        code: 'AU', map: '🇦🇺', phoneCode: 61, value: 'Australia',
      },
      {
        code: 'AT', map: '🇦🇹', phoneCode: 43, value: 'Austria',
      },
      {
        code: 'AZ', map: '🇦🇿', phoneCode: 994, value: 'Azerbaijan',
      },
      {
        code: 'BH', map: '🇧🇭', phoneCode: 973, value: 'Bahrain',
      },
      {
        code: 'BD', map: '🇧🇩', phoneCode: 880, value: 'Bangladesh',
      },
      {
        code: 'BB', map: '🇧🇧', phoneCode: 1246, value: 'Barbados',
      },
      {
        code: 'BY', map: '🇧🇾', phoneCode: 375, value: 'Belarus',
      },
      {
        code: 'BE', map: '🇧🇪', phoneCode: 32, value: 'Belgium',
      },
      {
        code: 'BZ', map: '🇧🇿', phoneCode: 501, value: 'Belize',
      },
      {
        code: 'BJ', map: '🇧🇯', phoneCode: 229, value: 'Benin',
      },
      {
        code: 'BM', map: '🇧🇲', phoneCode: 1441, value: 'Bermuda',
      },
      {
        code: 'BT', map: '🇧🇹', phoneCode: 975, value: 'Bhutan',
      },
      {
        code: 'BO', map: '🇧🇴', phoneCode: 591, value: 'Bolivia',
      },
      {
        code: 'BW', map: '🇧🇼', phoneCode: 267, value: 'Botswana',
      },
      {
        code: 'BV', map: '🇧🇻', phoneCode: 0, value: 'Bouvet Island',
      },
      {
        code: 'BR', map: '🇧🇷', phoneCode: 55, value: 'Brazil',
      },
      {
        code: 'IO', map: '🇮🇴', phoneCode: 246, value: 'British Indian Ocean Territory',
      },
      {
        code: 'BN', map: '🇧🇳', phoneCode: 673, value: 'Brunei',
      },
      {
        code: 'BG', map: '🇧🇬', phoneCode: 359, value: 'Bulgaria',
      },
      {
        code: 'BF', map: '🇧🇫', phoneCode: 226, value: 'Burkina Faso',
      },
      {
        code: 'BI', map: '🇧🇮', phoneCode: 257, value: 'Burundi',
      },
      {
        code: 'KH', map: '🇰🇭', phoneCode: 855, value: 'Cambodia',
      },
      {
        code: 'CM', map: '🇨🇲', phoneCode: 237, value: 'Cameroon',
      },
      {
        code: 'CA', map: '🇨🇦', phoneCode: 1, value: 'Canada',
      },
      {
        code: 'CV', map: '🇨🇻', phoneCode: 238, value: 'Cape Verde',
      },
      {
        code: 'KY', map: '🇰🇾', phoneCode: 1345, value: 'Cayman Islands',
      },
      {
        code: 'CF', map: '🇨🇫', phoneCode: 236, value: 'Central African Republic',
      },
      {
        code: 'TD', map: '🇹🇩', phoneCode: 235, value: 'Chad',
      },
      {
        code: 'CL', map: '🇨🇱', phoneCode: 56, value: 'Chile',
      },
      {
        code: 'CN', map: '🇨🇳', phoneCode: 86, value: 'China',
      },
      {
        code: 'CX', map: '🇨🇽', phoneCode: 61, value: 'Christmas Island',
      },
      {
        code: 'CC', map: '🇨🇨', phoneCode: 672, value: 'Cocos (Keeling) Islands',
      },
      {
        code: 'CO', map: '🇨🇴', phoneCode: 57, value: 'Colombia',
      },
      {
        code: 'KM', map: '🇰🇲', phoneCode: 269, value: 'Comoros',
      },
      {
        code: 'CK', map: '🇨🇰', phoneCode: 682, value: 'Cook Islands',
      },
      {
        code: 'CR', map: '🇨🇷', phoneCode: 506, value: 'Costa Rica',
      },
      {
        code: 'CU', map: '🇨🇺', phoneCode: 53, value: 'Cuba',
      },
      {
        code: 'CY', map: '🇨🇾', phoneCode: 357, value: 'Cyprus',
      },
      {
        code: 'DK', map: '🇩🇰', phoneCode: 45, value: 'Denmark',
      },
      {
        code: 'DJ', map: '🇩🇯', phoneCode: 253, value: 'Djibouti',
      },
      {
        code: 'DM', map: '🇩🇲', phoneCode: 1767, value: 'Dominica',
      },
      {
        code: 'DO', map: '🇩🇴', phoneCode: 1809, value: 'Dominican Republic',
      },
      {
        code: 'EC', map: '🇪🇨', phoneCode: 593, value: 'Ecuador',
      },
      {
        code: 'EG', map: '🇪🇬', phoneCode: 20, value: 'Egypt',
      },
      {
        code: 'SV', map: '🇸🇻', phoneCode: 503, value: 'El Salvador',
      },
      {
        code: 'GQ', map: '🇬🇶', phoneCode: 240, value: 'Equatorial Guinea',
      },
      {
        code: 'ER', map: '🇪🇷', phoneCode: 291, value: 'Eritrea',
      },
      {
        code: 'EE', map: '🇪🇪', phoneCode: 372, value: 'Estonia',
      },
      {
        code: 'ET', map: '🇪🇹', phoneCode: 251, value: 'Ethiopia',
      },
      {
        code: 'FK', map: '🇫🇰', phoneCode: 500, value: 'Falkland Islands',
      },
      {
        code: 'FO', map: '🇫🇴', phoneCode: 298, value: 'Faroe Islands',
      },
      {
        code: 'FI', map: '🇫🇮', phoneCode: 358, value: 'Finland',
      },
      {
        code: 'FR', map: '🇫🇷', phoneCode: 33, value: 'France',
      },
      {
        code: 'GF', map: '🇬🇫', phoneCode: 594, value: 'French Guiana',
      },
      {
        code: 'PF', map: '🇵🇫', phoneCode: 689, value: 'French Polynesia',
      },
      {
        code: 'TF', map: '🇹🇫', phoneCode: 0, value: 'French Southern Territories',
      },
      {
        code: 'GA', map: '🇬🇦', phoneCode: 241, value: 'Gabon',
      },
      {
        code: 'GE', map: '🇬🇪', phoneCode: 995, value: 'Georgia',
      },
      {
        code: 'DE', map: '🇩🇪', phoneCode: 49, value: 'Germany',
      },
      {
        code: 'GH', map: '🇬🇭', phoneCode: 233, value: 'Ghana',
      },
      {
        code: 'GI', map: '🇬🇮', phoneCode: 350, value: 'Gibraltar',
      },
      {
        code: 'GR', map: '🇬🇷', phoneCode: 30, value: 'Greece',
      },
      {
        code: 'GL', map: '🇬🇱', phoneCode: 299, value: 'Greenland',
      },
      {
        code: 'GD', map: '🇬🇩', phoneCode: 1473, value: 'Grenada',
      },
      {
        code: 'GP', map: '🇬🇵', phoneCode: 590, value: 'Guadeloupe',
      },
      {
        code: 'GU', map: '🇬🇺', phoneCode: 1671, value: 'Guam',
      },
      {
        code: 'GT', map: '🇬🇹', phoneCode: 502, value: 'Guatemala',
      },
      {
        code: 'GN', map: '🇬🇳', phoneCode: 224, value: 'Guinea',
      },
      {
        code: 'GW', map: '🇬🇼', phoneCode: 245, value: 'Guinea-Bissau',
      },
      {
        code: 'GY', map: '🇬🇾', phoneCode: 592, value: 'Guyana',
      },
      {
        code: 'HT', map: '🇭🇹', phoneCode: 509, value: 'Haiti',
      },
      {
        code: 'HN', map: '🇭🇳', phoneCode: 504, value: 'Honduras',
      },
      {
        code: 'HU', map: '🇭🇺', phoneCode: 36, value: 'Hungary',
      },
      {
        code: 'IS', map: '🇮🇸', phoneCode: 354, value: 'Iceland',
      },
      {
        code: 'IN', map: '🇮🇳', phoneCode: 91, value: 'India',
      },
      {
        code: 'ID', map: '🇮🇩', phoneCode: 62, value: 'Indonesia',
      },
      {
        code: 'IR', map: '🇮🇷', phoneCode: 98, value: 'Iran',
      },
      {
        code: 'IQ', map: '🇮🇶', phoneCode: 964, value: 'Iraq',
      },
      {
        code: 'IE', map: '🇮🇪', phoneCode: 353, value: 'Ireland',
      },
      {
        code: 'IL', map: '🇮🇱', phoneCode: 972, value: 'Israel',
      },
      {
        code: 'IT', map: '🇮🇹', phoneCode: 39, value: 'Italy',
      },
      {
        code: 'JM', map: '🇯🇲', phoneCode: 1876, value: 'Jamaica',
      },
      {
        code: 'JP', map: '🇯🇵', phoneCode: 81, value: 'Japan',
      },
      {
        code: 'JO', map: '🇯🇴', phoneCode: 962, value: 'Jordan',
      },
      {
        code: 'KZ', map: '🇰🇿', phoneCode: 7, value: 'Kazakhstan',
      },
      {
        code: 'KE', map: '🇰🇪', phoneCode: 254, value: 'Kenya',
      },
      {
        code: 'KI', map: '🇰🇮', phoneCode: 686, value: 'Kiribati',
      },
      {
        code: 'KW', map: '🇰🇼', phoneCode: 965, value: 'Kuwait',
      },
      {
        code: 'KG', map: '🇰🇬', phoneCode: 996, value: 'Kyrgyzstan',
      },
      {
        code: 'LA', map: '🇱🇦', phoneCode: 856, value: 'Laos',
      },
      {
        code: 'LV', map: '🇱🇻', phoneCode: 371, value: 'Latvia',
      },
      {
        code: 'LB', map: '🇱🇧', phoneCode: 961, value: 'Lebanon',
      },
      {
        code: 'LS', map: '🇱🇸', phoneCode: 266, value: 'Lesotho',
      },
      {
        code: 'LR', map: '🇱🇷', phoneCode: 231, value: 'Liberia',
      },
      {
        code: 'LY', map: '🇱🇾', phoneCode: 218, value: 'Libya',
      },
      {
        code: 'LI', map: '🇱🇮', phoneCode: 423, value: 'Liechtenstein',
      },
      {
        code: 'LT', map: '🇱🇹', phoneCode: 370, value: 'Lithuania',
      },
      {
        code: 'LU', map: '🇱🇺', phoneCode: 352, value: 'Luxembourg',
      },
      {
        code: 'MK', map: '🇲🇰', phoneCode: 389, value: 'Macedonia',
      },
      {
        code: 'MG', map: '🇲🇬', phoneCode: 261, value: 'Madagascar',
      },
      {
        code: 'MW', map: '🇲🇼', phoneCode: 265, value: 'Malawi',
      },
      {
        code: 'MY', map: '🇲🇾', phoneCode: 60, value: 'Malaysia',
      },
      {
        code: 'MV', map: '🇲🇻', phoneCode: 960, value: 'Maldives',
      },
      {
        code: 'ML', map: '🇲🇱', phoneCode: 223, value: 'Mali',
      },
      {
        code: 'MT', map: '🇲🇹', phoneCode: 356, value: 'Malta',
      },
      {
        code: 'MH', map: '🇲🇭', phoneCode: 692, value: 'Marshall Islands',
      },
      {
        code: 'MQ', map: '🇲🇶', phoneCode: 596, value: 'Martinique',
      },
      {
        code: 'MR', map: '🇲🇷', phoneCode: 222, value: 'Mauritania',
      },
      {
        code: 'MU', map: '🇲🇺', phoneCode: 230, value: 'Mauritius',
      },
      {
        code: 'YT', map: '🇾🇹', phoneCode: 269, value: 'Mayotte',
      },
      {
        code: 'MX', map: '🇲🇽', phoneCode: 52, value: 'Mexico',
      },
      {
        code: 'FM', map: '🇫🇲', phoneCode: 691, value: 'Micronesia',
      },
      {
        code: 'MD', map: '🇲🇩', phoneCode: 373, value: 'Moldova',
      },
      {
        code: 'MC', map: '🇲🇨', phoneCode: 377, value: 'Monaco',
      },
      {
        code: 'MN', map: '🇲🇳', phoneCode: 976, value: 'Mongolia',
      },
      {
        code: 'MS', map: '🇲🇸', phoneCode: 1664, value: 'Montserrat',
      },
      {
        code: 'MA', map: '🇲🇦', phoneCode: 212, value: 'Morocco',
      },
      {
        code: 'MZ', map: '🇲🇿', phoneCode: 258, value: 'Mozambique',
      },
      {
        code: 'NA', map: '🇳🇦', phoneCode: 264, value: 'Namibia',
      },
      {
        code: 'NR', map: '🇳🇷', phoneCode: 674, value: 'Nauru',
      },
      {
        code: 'NP', map: '🇳🇵', phoneCode: 977, value: 'Nepal',
      },
      {
        code: 'NC', map: '🇳🇨', phoneCode: 687, value: 'New Caledonia',
      },
      {
        code: 'NZ', map: '🇳🇿', phoneCode: 64, value: 'New Zealand',
      },
      {
        code: 'NI', map: '🇳🇮', phoneCode: 505, value: 'Nicaragua',
      },
      {
        code: 'NE', map: '🇳🇪', phoneCode: 227, value: 'Niger',
      },
      {
        code: 'NG', map: '🇳🇬', phoneCode: 234, value: 'Nigeria',
      },
      {
        code: 'NU', map: '🇳🇺', phoneCode: 683, value: 'Niue',
      },
      {
        code: 'NF', map: '🇳🇫', phoneCode: 672, value: 'Norfolk Island',
      },
      {
        code: 'MP', map: '🇲🇵', phoneCode: 1670, value: 'Northern Mariana Islands',
      },
      {
        code: 'NO', map: '🇳🇴', phoneCode: 47, value: 'Norway',
      },
      {
        code: 'OM', map: '🇴🇲', phoneCode: 968, value: 'Oman',
      },
      {
        code: 'PK', map: '🇵🇰', phoneCode: 92, value: 'Pakistan',
      },
      {
        code: 'PW', map: '🇵🇼', phoneCode: 680, value: 'Palau',
      },
      {
        code: 'PA', map: '🇵🇦', phoneCode: 507, value: 'Panama',
      },
      {
        code: 'PY', map: '🇵🇾', phoneCode: 595, value: 'Paraguay',
      },
      {
        code: 'PE', map: '🇵🇪', phoneCode: 51, value: 'Peru',
      },
      {
        code: 'PH', map: '🇵🇭', phoneCode: 63, value: 'Philippines',
      },
      {
        code: 'PL', map: '🇵🇱', phoneCode: 48, value: 'Poland',
      },
      {
        code: 'PT', map: '🇵🇹', phoneCode: 351, value: 'Portugal',
      },
      {
        code: 'PR', map: '🇵🇷', phoneCode: 1787, value: 'Puerto Rico',
      },
      {
        code: 'QA', map: '🇶🇦', phoneCode: 974, value: 'Qatar',
      },
      {
        code: 'RO', map: '🇷🇴', phoneCode: 40, value: 'Romania',
      },
      {
        code: 'RU', map: '🇷🇺', phoneCode: 70, value: 'Russia',
      },
      {
        code: 'RW', map: '🇷🇼', phoneCode: 250, value: 'Rwanda',
      },
      {
        code: 'WS', map: '🇼🇸', phoneCode: 684, value: 'Samoa',
      },
      {
        code: 'SM', map: '🇸🇲', phoneCode: 378, value: 'San Marino',
      },
      {
        code: 'SA', map: '🇸🇦', phoneCode: 966, value: 'Saudi Arabia',
      },
      {
        code: 'SN', map: '🇸🇳', phoneCode: 221, value: 'Senegal',
      },
      {
        code: 'RS', map: '🇷🇸', phoneCode: 381, value: 'Serbia',
      },
      {
        code: 'SC', map: '🇸🇨', phoneCode: 248, value: 'Seychelles',
      },
      {
        code: 'SL', map: '🇸🇱', phoneCode: 232, value: 'Sierra Leone',
      },
      {
        code: 'SG', map: '🇸🇬', phoneCode: 65, value: 'Singapore',
      },
      {
        code: 'SK', map: '🇸🇰', phoneCode: 421, value: 'Slovakia',
      },
      {
        code: 'SI', map: '🇸🇮', phoneCode: 386, value: 'Slovenia',
      },
      {
        code: 'SB', map: '🇸🇧', phoneCode: 677, value: 'Solomon Islands',
      },
      {
        code: 'SO', map: '🇸🇴', phoneCode: 252, value: 'Somalia',
      },
      {
        code: 'ZA', map: '🇿🇦', phoneCode: 27, value: 'South Africa',
      },
      {
        code: 'SS', map: '🇸🇸', phoneCode: 211, value: 'South Sudan',
      },
      {
        code: 'ES', map: '🇪🇸', phoneCode: 34, value: 'Spain',
      },
      {
        code: 'LK', map: '🇱🇰', phoneCode: 94, value: 'Sri Lanka',
      },
      {
        code: 'SD', map: '🇸🇩', phoneCode: 249, value: 'Sudan',
      },
      {
        code: 'SR', map: '🇸🇷', phoneCode: 597, value: 'Suriname',
      },
      {
        code: 'SZ', map: '🇸🇿', phoneCode: 268, value: 'Swaziland',
      },
      {
        code: 'SE', map: '🇸🇪', phoneCode: 46, value: 'Sweden',
      },
      {
        code: 'CH', map: '🇨🇭', phoneCode: 41, value: 'Switzerland',
      },
      {
        code: 'SY', map: '🇸🇾', phoneCode: 963, value: 'Syria',
      },
      {
        code: 'TW', map: '🇹🇼', phoneCode: 886, value: 'Taiwan',
      },
      {
        code: 'TJ', map: '🇹🇯', phoneCode: 992, value: 'Tajikistan',
      },
      {
        code: 'TZ', map: '🇹🇿', phoneCode: 255, value: 'Tanzania',
      },
      {
        code: 'TH', map: '🇹🇭', phoneCode: 66, value: 'Thailand',
      },
      {
        code: 'TG', map: '🇹🇬', phoneCode: 228, value: 'Togo',
      },
      {
        code: 'TK', map: '🇹🇰', phoneCode: 690, value: 'Tokelau',
      },
      {
        code: 'TO', map: '🇹🇴', phoneCode: 676, value: 'Tonga',
      },
      {
        code: 'TN', map: '🇹🇳', phoneCode: 216, value: 'Tunisia',
      },
      {
        code: 'TR', map: '🇹🇷', phoneCode: 90, value: 'Turkey',
      },
      {
        code: 'TM', map: '🇹🇲', phoneCode: 7370, value: 'Turkmenistan',
      },
      {
        code: 'TV', map: '🇹🇻', phoneCode: 688, value: 'Tuvalu',
      },
      {
        code: 'UG', map: '🇺🇬', phoneCode: 256, value: 'Uganda',
      },
      {
        code: 'UA', map: '🇺🇦', phoneCode: 380, value: 'Ukraine',
      },
      {
        code: 'AE', map: '🇦🇪', phoneCode: 971, value: 'United Arab Emirates',
      },
      {
        code: 'GB', map: '🇬🇧', phoneCode: 44, value: 'United Kingdom',
      },
      {
        code: 'US', map: '🇺🇸', phoneCode: 1, value: 'United States',
      },
      {
        code: 'UY', map: '🇺🇾', phoneCode: 598, value: 'Uruguay',
      },
      {
        code: 'UZ', map: '🇺🇿', phoneCode: 998, value: 'Uzbekistan',
      },
      {
        code: 'VU', map: '🇻🇺', phoneCode: 678, value: 'Vanuatu',
      },
      {
        code: 'VE', map: '🇻🇪', phoneCode: 58, value: 'Venezuela',
      },
      {
        code: 'VN', map: '🇻🇳', phoneCode: 84, value: 'Vietnam',
      },
      {
        code: 'EH', map: '🇪🇭', phoneCode: 212, value: 'Western Sahara',
      },
      {
        code: 'YE', map: '🇾🇪', phoneCode: 967, value: 'Yemen',
      },
      {
        code: 'ZM', map: '🇿🇲', phoneCode: 260, value: 'Zambia',
      },
      {
        code: 'ZW', map: '🇿🇼', phoneCode: 26, value: 'Zimbabwe',
      }].flat();

    country.forEach((num) => {
      CountryCode
        .create({
          code: num.code,
          map: num.map,
          phoneCode: `+${num.phoneCode}`,
          countryName: num.value,
        });
    });
    UserState.updateOne(
      {
        phone: fromNumber,
      },
      {
        $set: {
          last: 'tracking',
        },
      },
    ).exec();
  };

  function sendMarketing() {
    msgCtrl.sendMsg({
      fromNumber,
      msg: 'We\'d love to hear your review! Got a minute to share it with us?\n1. Yes\n2. No',
    });
    UserState.updateOne(
      {
        phone: fromNumber,
      },
      {
        $set: {
          last: 'marketing',
        },
      },
    ).exec();
  }

  const referToFriend = () => {
    msgCtrl.sendMsg({
      fromNumber,
      msg: 'Would you like to refer your friends to get discount?\n1. Yes\n2. No',
    });
    UserState.updateOne(
      {
        phone: fromNumber,
      },
      {
        $set: {
          last: 'refer',
        },
      },
    ).exec();
  };

  const sendViewCart = (state) => {
    const storedLineItemsText = state.storedLineItems
      .filter((x) => x.title && x.quantity)
      .map(
        ({ title, quantity, productTitle }, idx) => `${idx + 1}. ${productTitle}, ${title}, quantity: *${quantity}*`,
      )
      .join('\n');

    const txt = `Your cart is:\n${storedLineItemsText}\n\n\nWhat do you want to do next?\n1. Continue Shopping \n2. Proceed to payment \n3. Delete item\n${backToMenu}\n\n\n${typeRecomendation}`;
    msgCtrl.sendMsg({
      fromNumber,
      msg: txt,
    });
    UserState.updateOne(
      {
        phone: fromNumber,
      },
      {
        $set: {
          last: 'cart',
        },
      },
    ).exec();
  };

  function sendDiscount() {
    const discountSlug = generateSlug();
    shopifyApi.shopifyDiscountCreate(
      discountSlug,
    )
      .then((response) => {
        const { code } = response.data.discount_code;
        const discountedUrl = `http://${userSettings.shopify.externalUrl}/discount/${code}`;

        UserDiscount
          .create({
            discountCode: discountSlug,
            phone: fromNumber,
            notifiedCount: 0,
          })
          .then(() => {
            msgCtrl.sendMsg({
              fromNumber,
              msg: `Hi! Here is your promocode: ${discountedUrl}\nPlease click this link to proceed or type 0 to go to Main Menu`,
            });
            UserState.updateOne(
              {
                phone: fromNumber,
              },
              {
                $set: {
                  last: 'return-to-main-if-0-pressed',
                },
              },
            ).exec();
          })
          .catch(errorHandler);
      })
      .catch(errorHandler);
  }
  function sendAbandonedDiscount() {
    const discountSlug = generateSlug();
    shopifyApi.shopifyDiscountCreate(
      discountSlug,
    )
      .then((response) => {
        const { code } = response.data.discount_code;
        const discountedUrl = `http://${userSettings.shopify.externalUrl}/discount/${code}`;

        UserAbandonedDiscount
          .create({
            discountCode: discountSlug,
            phone: fromNumber,
            notifiedCount: 0,
          })
          .then(() => {
            msgCtrl.sendMsg({
              fromNumber,
              msg: `Hi! Here is your promocode: ${discountedUrl}\nPlease click this link to proceed or type 0 to go to Main Menu`,
            });
            UserState.updateOne(
              {
                phone: fromNumber,
              },
              {
                $set: {
                  last: 'return-to-main-if-0-pressed',
                },
              },
            ).exec();
          })
          .catch(errorHandler);
      })
      .catch(errorHandler);
  }
  function sendDiscountToFriend() {
    const discountSlug = generateSlug();
    shopifyApi.shopifyDiscountCreate(
      discountSlug,
    )
      .then((response) => {
        const { code } = response.data.discount_code;
        const discountedUrl = `http://${userSettings.shopify.externalUrl}/discount/${code}`;

        UserDiscount
          .create({
            discountCode: discountSlug,
            phone: fromNumber,
            notifiedCount: 0,
          })
          .then(() => {
            msgCtrl.sendMsg({
              fromNumber,
              msg: `Hey! I'm invite you check out Banarasi Outfits :)\nPlease click this link, we'll both get a discount.\n\nHere is your promocode: ${discountedUrl}\n----------------\nPlease click this link to proceed`,
            });
          })
          .catch(errorHandler);
      })
      .catch(errorHandler);
  }
  function continueDialog(state) {
    if (msg === '0') {
      sendMainMenu(0, false);
      return;
    }

    if (msg.toLowerCase() === 'discount') {
      sendDiscount();
      return;
    }

    if (state.last === 'main') {
      switch (msg) {
        case '1': {
          sendCatalog();
          break; }
        // case '2': {
        //   getSupport();
        //   break; }
        case '2': {
          getOrderStatus();
          break; }
        case '3': {
          sendAbandonedDiscount();
          break;
        }
        case '4': {
          sendMarketing();
          break;
        }
        case '5': {
          sendViewCart(state);
          break;
        }
        default: {
          resendCommand(fromNumber);
          break;
        }
      }
    } else if (state.last === 'tracking') {
      if (/@/.test(msg)) {
        shopifyApi.getAllOrders()
          .then((response) => {
            const trackUrls = response.data.orders
              .filter((ord) => ord.email === msg)
              .map((ord) => ord.fulfillments)
              .flat().map(
                (tr, idx) => {
                  if (!tr.tracking_url) {
                    const txtUrl = `${idx + 1}. Your tracking number: ${tr.tracking_number} and tracking URL: https://t.17track.net/en#nums=${tr.tracking_number}`;
                    return txtUrl;
                  }
                  const txtUrl = `${idx + 1}. Your tracking number: ${tr.tracking_numbers} and tracking URL: ${tr.tracking_urls}`;
                  return txtUrl;
                },
              )
              .join('\n');
            if (!trackUrls) {
              msgCtrl.sendMsg({
                fromNumber,
                msg: 'There is no order with such email, please recheck your email.\n\n--------------\nOR type 0 to redirect to main menu',
              });
              return;
            }
            const txt = `Orders for email '${msg}':\n${trackUrls}\n\n(Please open link to track your order!)\n\n${backToMenu}\n\n\n${typeRecomendation}`;
            msgCtrl.sendMsg({
              fromNumber,
              msg: txt,
            });
            setTimeout(() => {
              sendMarketing();
            }, 5000);
          })
          .catch(errorHandler);
      } else {
        const trackingUrl = `https://t.17track.net/en#nums=${msg}`;
        msgCtrl.sendMsg({
          fromNumber,
          msg: `Please open this link to track your order!\n${trackingUrl}\n\n--------------\nOR type 0 to redirect to main menu`,
        });
      }
    } else if (state.last === 'support') {
      axios
        .post('https://saletastic-admin-server.herokuapp.com/support', {
          accountSid,
          msg,
          whatsappNumber: fromNumber,
          profileName: req.body.ProfileName,
        })
        .then((chatResponse) => {
          console.log(`\n\n\n\nchatResponse:\n${chatResponse.status}\n${chatResponse.data}\n\n\n\n`);
        })
        .catch(console.log);
    } else if (state.last === 'marketing') {
      switch (msg) {
        case '1': {
          msgCtrl.sendMsg({
            fromNumber,
            msg: 'Please type your feedback:',
          });
          UserState.updateOne(
            {
              phone: fromNumber,
            },
            {
              last: 'review',
            },
          ).exec();
          break;
        }
        case '2':
          referToFriend();
          break;
        default: {
          resendCommand();
          break;
        }
      }
    } else if (state.last === 'review') {
      UserReview
        .create({
          phone: fromNumber,
          text: msg,
        })
        .then(() => {
          msgCtrl.sendMsg({
            fromNumber,
            msg: 'Thank you so much for your review!!!',
          });
          setTimeout(() => {
            referToFriend();
          }, 3000);
        }).catch(errorHandler);
    } else if (state.last === 'refer') {
      switch (msg) {
        case '1': {
          msgCtrl.sendMsg({
            fromNumber,
            msg: 'Please forward below message.',
          });
          setTimeout(() => {
            sendDiscountToFriend();
            setTimeout(() => {
              sendMainMenu();
            }, 5000);
          }, 3000);
          break;
        }
        case '2': {
          sendMainMenu();
          break; }
        default: {
          resendCommand();
          break;
        }
      }
    } else if (state.last === 'catalog') {
      if (!state.catalogs[msg - 1]) {
        resendCommand(fromNumber);
        return;
      }
      const { handle } = state.catalogs[msg - 1].node;
      shopifyApi.getProductsByCollectionHandle(handle).then(
        (response) => {
          const products = response.collectionByHandle.products.edges;
          let txt = products
            .map((pr, idx) => `${idx + 1}. ${pr.node.title}`)
            .join('\n');
          txt = `Select Product:\n${txt}\n${backToMenu}\n\n\n${typeRecomendation}`;

          msgCtrl.sendMsg({
            fromNumber,
            msg: txt,
          });
          UserState.updateOne(
            {
              phone: fromNumber,
            },
            {
              last: 'products',
              products,
              $set: {
                last: 'products',
                products,
              },
            },
          ).exec();
        },
      ).catch(errorHandler);
    } else if (state.last === 'products') {
      if (!state.products[msg - 1]) {
        resendCommand(fromNumber);
        return;
      }

      const { title: productTitle, id: productID } = state.products[msg - 1].node;
      shopifyApi.retireveVariantsOfProduct(productID).then(
        (response) => {
          const variants = response.node.variants.edges;
          for (let i = 0; i < variants.length; i++) {
            const v = variants[i];
            v.productTitle = productTitle;
          }
          let mediaUrlList = variants.map(
            (item) => item.node.image && item.node.image.originalSrc,
          );
          mediaUrlList = mediaUrlList.filter((x) => !!x);

          if (mediaUrlList && mediaUrlList.length) {
            msgCtrl.sendMediaList({
              fromNumber,
              msg: 'Select variants',
              mediaUrlList,
            }).then(() => {
              setTimeout(() => {
                let txt = variants
                  .map((v, idx) => `${idx + 1}. ${v.node.title}`)
                  .join('\n');
                txt = `${variants[0].productTitle}:\n${txt}\n${backToMenu}\n\n\n${typeRecomendation}`;
                msgCtrl.sendMsg({
                  fromNumber,
                  msg: txt,
                });
              }, 5000);
            });
          } else {
            let txt = variants
              .map((v, idx) => `${idx + 1}. ${v.node.title}`)
              .join('\n');
            txt = `Select Variants of ${variants[0].productTitle}:\n${txt}\n${backToMenu}\n\n\n${typeRecomendation}`;
            msgCtrl.sendMsg({
              fromNumber,
              msg: txt,
            });
          }
          UserState.updateOne(
            {
              phone: fromNumber,
            },
            {
              $set: {
                last: 'variants',
                variants,
              },
            },
          ).exec();
        },
      ).catch(errorHandler);
    } else if (state.last === 'variants') {
      if (!state.variants[msg - 1]) {
        resendCommand(fromNumber);
        return;
      }
      const { id: variantID, title } = state.variants[msg - 1].node;
      const { productTitle } = state.variants[msg - 1];
      const storedLineItems = state.storedLineItems || [];
      const existsVariant = storedLineItems.find(
        (x) => x.variantId === variantID,
      );
      if (existsVariant) {
        existsVariant.quantity += 1;
        existsVariant.productTitle = productTitle;
      } else {
        storedLineItems.push({
          variantId: variantID,
          quantity: 1,
          title,
          productTitle,
        });
      }
      const txt = `Your item is placed in cart. What do you want next ?\n1. Continue shopping.\n2. See my cart.\n3. Proceed to payment.\n${backToMenu}\n\n\n${typeRecomendation}`;
      msgCtrl.sendMsg({
        fromNumber,
        msg: txt,
      });
      UserState.updateOne(
        {
          phone: fromNumber,
        },
        {
          $set: {
            last: 'added-to-cart',
            storedLineItems,
          },
        },
      ).exec();
    } else if (state.last === 'added-to-cart') {
      switch (msg) {
        case '1': {
          sendCatalog();
          break;
        }
        case '2':
          {
            const storedLineItemsText = state.storedLineItems
              .filter((x) => x.title && x.quantity)
              .map(
                ({ title, quantity, productTitle }, idx) => `${idx + 1}. ${productTitle}, ${title}, quantity: *${quantity}*`,
              )
              .join('\n');

            const txt = `Your cart is:\n${storedLineItemsText}\n\n\nWhat do you want to do next?\n1. Continue Shopping \n2. Proceed to payment \n3. Delete item\n${backToMenu}\n\n\n${typeRecomendation}`;
            msgCtrl.sendMsg({
              fromNumber,
              msg: txt,
            });
            UserState.updateOne(
              {
                phone: fromNumber,
              },
              {
                $set: {
                  last: 'cart',
                },
              },
            ).exec();
          }
          break;
        case '3': {
          createCheckoutWithDiscount(state);
          break; }
        default: {
          resendCommand();
          break;
        }
      }
    } else if (state.last === 'cart') {
      switch (msg) {
        case '2': {
          createCheckoutWithDiscount(state);
          break;
        }
        case '3': {
          const storedLineItemsText = state.storedLineItems
            .filter((x) => x.title && x.quantity)
            .map(
              ({ title, quantity, productTitle }, idx) => `${idx + 1}. ${productTitle}, ${title}, quantity: *${quantity}*`,
            )
            .join('\n');
          const txt = `Select item that you are gonna delete\n\n${storedLineItemsText}\n${backToMenu}\n\n\n${typeRecomendation}`;
          msgCtrl.sendMsg({
            fromNumber,
            msg: txt,
          });
          UserState.updateOne({
            phone: fromNumber,
          }, {
            $set: {
              last: 'deleteItem',
            },
          }).exec();
          break;
        }
        case '1': {
          sendCatalog();
          break;
        }
        default: {
          resendCommand();
          break;
        }
      }
    } else if (state.last === 'deleteItem') {
      state.storedLineItems.splice(msg - 1, 1);
      const storedLineItemsText = state.storedLineItems
        .filter((x) => x.title && x.quantity)
        .map(
          ({ title, quantity, productTitle }, idx) => `${idx + 1}. ${productTitle}, ${title}, quantity: *${quantity}*`,
        )
        .join('\n');
      const txt = `Your cart is:\n${storedLineItemsText}\n\n\nWhat do you want to do next?\n1. Continue Shopping \n2. Proceed to payment \n3. Delete item\n${backToMenu}\n\n\n${typeRecomendation}`;
      msgCtrl.sendMsg({
        fromNumber,
        msg: txt,
      });
      UserState.updateOne(
        {
          phone: fromNumber,
        },
        {
          $set: {
            last: 'cart',
            storedLineItems: state.storedLineItems,
          },
        },
      ).exec();
    } else if (state.last === 'demoMain') {
      if (msg === '1') {
        sendDiscount();
      } else {
        sendMainMenu(0, true);
      }
    } else if (state.last === 'return-to-main-if-0-pressed') {
      if (msg === '0') {
        sendMainMenu();
      }
    } else {
      resendCommand();
    }
  }

  UserState
    .findOne({
      phone: fromNumber,
    },
    (err, result) => {
      if (err) {
        return console.log(err);
      }
      if (!result) {
        createNewDialog();
      } else if (getProviderResult.firstlyJoined === true) {
        sendMainMenu(0, true);
      } else continueDialog(result);
      return result;
    });
}
function handleStatus(req, res) {
  res.send('status');
}
module.exports = {
  handleMessage,
  handleStatus,
};
