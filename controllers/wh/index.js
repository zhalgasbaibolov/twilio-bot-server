/* eslint-disable no-console */
const axios = require('axios');
const { generateSlug } = require('random-word-slugs');

const UserState = require('../../db/models/UserState');
const UserDiscount = require('../../db/models/UserDiscount');
const UserAbandonedDiscount = require('../../db/models/UserAbandonedDiscount');
const UserReview = require('../../db/models/UserReview');

const { getProviders } = require('../../providers');

async function handleMessage(req, res) {
  res.send('OK');
  const getProviderResult = await getProviders(req);
  if (!getProviderResult) {
    return;
  }
  const { msgCtrl, shopifyApi, userSettings } = getProviderResult;
  const { accountSid } = userSettings.twilio;

  const fromNumber = req.body.From;
  const msg = req.body.Body;

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
  function sendMainMenu(ms = 0, firstTime = false) {
    const firstWord = firstTime ? 'Hello! What do you want?' : 'What would you like to do now?';
    const viewCart = firstTime ? '' : '6. View cart';
    setTimeout(() => {
      msgCtrl.sendMsg({
        fromNumber,
        msg: `${firstWord}\n1. Catalogue\n2. Customer Support\n3. Order Status\n4. Get discount (Abandoned cart)\n5. Loyalty program (organic marketing)\n${viewCart}\n\n\n${typeRecomendation}`,
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
    const checkoutUrl = state.storedLineItems.filter((x) => x.variantId && x.quantity).map(({ variantID, quantity }) => `#{${variantID}}:#{${quantity}}`).join('');

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
  const getSupport = () => {
    msgCtrl.sendMsg({
      fromNumber,
      msg: `Hi there! Welcome to Customer Support Service!\nTo start conversation please type your message\n(the Team usually replies in a few minutes)\n${backToMenu}\n\n\n${typeRecomendation}`,
    });
    UserState.updateOne(
      {
        phone: fromNumber,
      },
      {
        $set: {
          last: 'support',
        },
      },
    ).exec();
  };

  const getOrderStatus = () => {
    msgCtrl.sendMsg({
      fromNumber,
      msg: `Type your tracking number OR email.\n${backToMenu}\n\n\n${typeRecomendation}`,
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
        case '2': {
          getSupport();
          break; }
        case '3': {
          getOrderStatus();
          break; }
        case '4': {
          sendAbandonedDiscount();
          break;
        }
        case '5': {
          sendMarketing();
          break;
        }
        case '6': {
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
          const mediaUrlList = variants.map(
            (item) => item.node.image && item.node.image.originalSrc,
          );
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
