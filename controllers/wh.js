/* eslint-disable no-console */
const {
  generateSlug,
} = require('random-word-slugs');
const UserStates = require('../db/models/Userstate');
const UserSetting = require('../db/models/UserSettings');
const UserDiscount = require('../db/models/UserDiscount');
const UserReview = require('../db/models/UserReview');
const WhatsapSender = require('../providers/WhatsapSender');

// const storeAPIkey = 'a55e9f8e5d6feebd23752396acd80cc4';
// const storePassword = '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';
// const accessToken = '9d75b9d30a16f02bb9517f2aafd9bd48';
// const storeMyShopify = 'banarasi-outfit.myshopify.com';
// const externalUrl = 'banarasioutfit.in';
// const apiVersion = '2021-04';
// const priceRuleId = '942249935042';

const {
  ShopifyApi,
} = require('../providers/shopifyApi');
const {
  shopifyDiscountCreate,
} = require('./discountRestAPI');
const {
  getAllOrders,
} = require('../getAllOrders');

async function handleMessage(req, res) {
  res.status(200).send('');
  const accountSid = req.body.AccountSid;
  const fromNumber = req.body.From;
  const msg = req.body.Body;
  console.log('wh controller', fromNumber, msg, req.body);
  if (fromNumber === 'whatsapp:+14155238886') {
    return;
  }

  let userSettings = null;
  try {
    userSettings = await UserSetting.find({}).exec();
    userSettings = userSettings.find(
      (sett) => sett && sett.twilio && sett.twilio.accountSid === accountSid,
    );
    if (!userSettings || !userSettings.twilio || !userSettings.shopify) {
      console.log('wrong user settings:', userSettings);
      return;
    }
  } catch (getSettigsErr) {
    console.log(getSettigsErr);
    return;
  }
  const msgCtrl = new WhatsapSender(userSettings.twilio);
  const shopifyApi = new ShopifyApi(userSettings.shopify);
  const errorHandler = (err) => {
    // eslint-disable-next-line no-console
    console.log(err);
    msgCtrl.sendMsg({
      fromNumber,
      msg: JSON.stringify(err),
    });
  };
  function createNewDialog() {
    UserStates
      .create({
        phone: fromNumber,
        last: 'demoMain',
      })
      .then(() => {
        msgCtrl.sendMsg({
          fromNumber,
          msg: 'Hello! Are your here to receive a discount for Banasari Outfits ?\n1. Yes\n2. No',
        });
      }).catch(errorHandler);
  }
  function sendMainMenu(ms = 0, firstTime = false) {
    const firstWord = firstTime ? 'Hello! What do you want?' : 'Is there anything else that you want?';
    setTimeout(() => {
      msgCtrl.sendMsg({
        fromNumber,
        msg: `${firstWord}\n1. Catalogue\n2. Customer Support\n3. Order Status\n4. Abandoned cart\n5. Loyalty program (organic marketing)`,
      });
      UserStates.updateOne(
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
      const collections = `Select Catalogue:\n${
        response.collections.edges
          .map((val, idx) => `${idx + 1}. ${val.node.handle}`)
          .join('\n')}`;
      msgCtrl.sendMsg({
        fromNumber,
        msg: collections,
      });
      console.log(UserStates);
      UserStates.updateOne(
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
      msg: 'Please, send right command\nOr type *main* to redirect to main menu',
    });
  }
  const getSupport = () => {
    msgCtrl.sendMsg({
      fromNumber,
      msg: 'Hi there! Welcome to Customer Support Service! Please describe your problem, we will be contact with you within 10 minutes.',
    });
    sendMainMenu(5000);
  };

  const getOrderStatus = () => {
    msgCtrl.sendMsg({
      fromNumber,
      msg: 'Type your tracking number OR email.\n(Demo: copy paste below tracking number)',
    });
    setTimeout(() => {
      msgCtrl.sendMsg({
        fromNumber,
        msg: 'UH037386106US',
      });
    }, 3000);
    UserStates.updateOne(
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

  const sendMarketing = () => {
    msgCtrl.sendMsg({
      fromNumber,
      msg: 'Would you like to leave us a review for 5 points?\n1. Yes\n2. No',
    });
    UserStates.updateOne(
      {
        phone: fromNumber,
      },
      {
        $set: {
          last: 'marketing',
        },
      },
    ).exec();
  };

  const referToFriend = () => {
    msgCtrl.sendMsg({
      fromNumber,
      msg: 'Would you like to refer your friends to earn loyalty points?\n1. Yes\n2. No',
    });
    UserStates.updateOne(
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

  function sendDiscount() {
    const discountSlug = generateSlug();
    shopifyDiscountCreate(
      discountSlug,
    )
      .then((response) => {
        const { code } = response.data.discount_code;
        const discountedUrl = `http://${userSettings.shopify.externalUrl}/discount/${code}`;

        UserDiscount
          .create({
            discountCode: discountSlug,
            phone: fromNumber,
          })
          .then(() => {
            msgCtrl.sendMsg({
              fromNumber,
              msg: `Here is your promocode(click this link): ${discountedUrl}\nPlease click this link to proceed or click '5' to return`,
            });
            UserStates.updateOne(
              {
                phone: fromNumber,
              },
              {
                $set: {
                  last: 'return-to-main-if-5-pressed',
                },
              },
            ).exec();
          })
          .catch(errorHandler);
      })
      .catch(errorHandler);
  }
  function continueDialog(state) {
    if (msg.toLowerCase() === 'main') {
      sendMainMenu(0, true);
      return;
    }

    if (state.last === 'main') {
      switch (msg) {
        case '1': {
          sendCatalog();
          break; }
        case '2': {
          getSupport();
          break; }
        case '3': {
          getOrderStatus();
          break; }
        case '4': {
          sendDiscount();
          break;
        }
        case '5': {
          sendMarketing();
          break;
        }
        default: {
          resendCommand(fromNumber);
          break;
        }
      }
    } else if (state.last === 'tracking') {
      if (/@/.test(msg)) {
        getAllOrders()
          .then((response) => {
            const trackNumbers = response.data.orders
              .filter((ord) => ord.email === msg)
              .map((ord) => ord.fulfillments.tracking_nunmbers)
              .flat();
            const arr = Array.from(new Set(trackNumbers));
            const ordersListTxt = arr
              .map(
                (trackNum, idx) => `${idx + 1}. https://t.17track.net/en#nums=${trackNum}`,
              )
              .join('\n');
            if (!ordersListTxt) {
              msgCtrl.sendMsg({
                fromNumber,
                msg: 'There is no order with such email, please recheck your email.',
              });
              return;
            }
            const txt = `Orders for email '${msg}':\n${ordersListTxt}`;
            msgCtrl.sendMsg({
              fromNumber,
              msg: txt,
            });
            sendMainMenu(5000);
          })
          .catch(errorHandler);
      } else {
        const trackingUrl = `https://t.17track.net/en#nums=${msg}`;
        msgCtrl.sendMsg({
          fromNumber,
          msg: `Please open this link to track your order!\n${trackingUrl}`,
        });
        sendMainMenu(5000);
      }
    } else if (state.last === 'marketing') {
      switch (msg) {
        case '1': {
          msgCtrl.sendMsg({
            fromNumber,
            msg: 'Please type your review:',
          });
          UserStates.updateOne(
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
          msgCtrl.sendMsg({
            fromNumber,
            msg: 'Please, send right command',
          });
          break;
        }
      }
    } else if (state.last === 'review') {
      UserReview
        .create({
          phone: fromNumber,
          text: msg,
        })
        .then(referToFriend).catch(errorHandler);
    } else if (state.last === 'refer') {
      switch (msg) {
        case '1': {
          msgCtrl.sendMsg({
            fromNumber,
            msg: 'Please forward below message.',
          });
          setTimeout(() => {
            msgCtrl.sendMsg({
              fromNumber,
              msg: 'Hey! I\'m invite you check out Banarasi Outfits :)\nPlease click this link, we\'ll both get a discount.\nhttps://banarasioutfit.in/QkDXv9mr2bGzYaeRKE',
            });
            sendMainMenu(5000);
          }, 3000);
          break;
        }
        case '2': {
          sendMainMenu();
          break; }
        default: {
          msgCtrl.sendMsg({
            fromNumber,
            msg: 'Please, send right command',
          });
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
            .map((pr, idx) => `${idx + 1}. ${pr.node.handle}`)
            .join('\n');
          txt = `Select Product:\n${txt.split('-').join(' ')}`;

          msgCtrl.sendMsg({
            fromNumber,
            msg: txt,
          });
          UserStates.updateOne(
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

      const productID = state.products[msg - 1].node.id;
      shopifyApi.retireveVariantsOfProduct(productID).then(
        (response) => {
          const variants = response.node.variants.edges;
          const variantsSize = variants.length;
          variants.forEach((item, indx) => {
            const { title } = item.node;
            const imgUrl = item.node.image.originalSrc;
            msgCtrl.sendMsg({
              fromNumber,
              msg: `${indx + 1}. ${title}`,
              mediaUrl: imgUrl,
            });
            if (indx === variantsSize - 1) {
              setTimeout(() => {
                let txt = variants
                  .map((v, idx) => `${idx + 1}. ${v.node.title}`)
                  .join('\n');
                txt = `Select Variants:\n${txt}`;
                msgCtrl.sendMsg({
                  fromNumber,
                  msg: txt,
                });
                UserStates.updateOne(
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
              }, 3000);
            }
          });
        },
      ).catch(errorHandler);
    } else if (state.last === 'variants') {
      if (!state.variants[msg - 1]) {
        resendCommand(fromNumber);
        return;
      }
      const { id: variantID, title } = state.variants[msg - 1].node;
      const storedLineItems = state.storedLineItems || [];
      const existsVariant = storedLineItems.find(
        (x) => x.variantId === variantID,
      );
      if (existsVariant) existsVariant.quantity += 1;
      else {
        storedLineItems.push({
          variantId: variantID,
          quantity: 1,
          title,
        });
      }
      const txt = 'Your item is placed in cart. What do you want next ?\n1. Continue shopping.\n2. See my cart.\n3. Proceed to payment.';
      msgCtrl.sendMsg({
        fromNumber,
        msg: txt,
      });
      UserStates.updateOne(
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
                ({ title, quantity }, idx) => `${idx + 1}. ${title}: ${quantity}`,
              )
              .join('\n');
            const txt = `Your cart is:\n${storedLineItemsText}\n\nWhat do you want to do next?\n1. Continue Shopping \n2. Proceed to payment \n3. Delete item`;
            msgCtrl.sendMsg({
              fromNumber,
              msg: txt,
            });
            UserStates.updateOne(
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
          shopifyApi.createCheckoutList(
            state.storedLineItems.map((x) => ({
              variantId: x.variantId,
              quantity: x.quantity,
            })),
          )
            .then((createdCheckoutInfo) => {
              const txt = `Congratulations!\nYour order is almost created.\nPlease, open this url and finish him!\n ${
                createdCheckoutInfo.checkoutCreate.checkout.webUrl}`;
              msgCtrl.sendMsg({
                fromNumber,
                msg: txt,
              });
              sendMainMenu(5000);
              UserStates.updateOne({
                phone: fromNumber,
              },
              {
                $set: {
                  storedLineItems: [],
                },
              }).exec();
            }).catch(errorHandler);

          break; }
        default: {
          msgCtrl.sendMsg({
            fromNumber,
            msg: 'Please, send right command',
          });
          break;
        }
      }
    } else if (state.last === 'cart') {
      switch (msg) {
        case '2': {
          shopifyApi.createCheckoutList(
            state.storedLineItems.map((x) => ({
              variantId: x.variantId,
              quantity: x.quantity,
            })),
          )
            .then((createdCheckoutInfo) => {
              const txt = `Congratulations!\nYour order is almost created.\nPlease, open this url and finish him!\n ${
                createdCheckoutInfo.checkoutCreate.checkout.webUrl}`;
              msgCtrl.sendMsg({
                fromNumber,
                msg: txt,
              });
              sendMainMenu(5000);
              UserStates.updateOne({
                phone: fromNumber,
              },
              {
                $set: {
                  storedLineItems: [],
                },
              }).exec();
            }).catch(errorHandler);
          break;
        }
        case '3': {
          const storedLineItemsText = state.storedLineItems
            .filter((x) => x.title && x.quantity)
            .map(
              ({ title, quantity }, idx) => `${idx + 1}. ${title}: ${quantity}`,
            )
            .join('\n');
          const txt = `${storedLineItemsText}\nSelect item that you are gonna delete`;
          msgCtrl.sendMsg({
            fromNumber,
            msg: txt,
          });
          UserStates.updateOne({
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
          msgCtrl.sendMsg({
            fromNumber,
            msg: 'Please, send right command',
          });
          break;
        }
      }
    } else if (state.last === 'deleteItem') {
      state.storedLineItems.splice(msg - 1, 1);
      const storedLineItemsText = state.storedLineItems
        .filter((x) => x.title && x.quantity)
        .map(
          ({ title, quantity }, idx) => `${idx + 1}. ${title}: ${quantity}`,
        )
        .join('\n');
      const txt = `Your cart is:\n${storedLineItemsText}\n\nWhat do you want to do next?\n1. Continue Shopping \n2. Proceed to payment \n3. Delete item`;
      msgCtrl.sendMsg({
        fromNumber,
        msg: txt,
      });
      UserStates.updateOne(
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
    } else if (state.last === 'return-to-main-if-5-pressed') {
      if (msg === '5') {
        sendMainMenu();
      }
    } else {
      resendCommand();
    }
  }

  UserStates
    .findOne({
      phone: fromNumber,
    },
    (err, result) => {
      if (err) {
        return console.log(err);
      }
      if (!result) {
        createNewDialog();
      } else {
        continueDialog(result);
      }
      return result;
    });
}
module.exports = {
  handleMessage,
};
