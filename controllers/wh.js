const {
  generateSlug,
} = require('random-word-slugs');
const UserStates = require('../db/models/Userstate');
const discounts = require('../db/models/Userstate');
const msgCtrl = require('./msg');

const accessToken = '0386d977a264448a1b62c295ac542a0d';
const storeAPIkey = '0f6b58da9331414de7ed1d948c67ac35';
const storePassword = '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';
const storeMyShopify = 'fat-cat-studio.myshopify.com';
const priceRuleId = '950294741183';
const apiVersion = '2021-04';
const {
  retireveCollections,
  createCheckoutList,
  getProductsByCollectionHandle,
  retireveVariantsOfProduct,
} = require('./storefrontAPI');
const {
  shopifyDiscountCreate,
} = require('./discountRestAPI');
const {
  getAllOrders,
} = require('../getAllOrders');

function handleMessage(req, res) {
  res.status(200).send('');

  const fromNumber = req.body.From || req.body.From;
  if (fromNumber === 'whatsapp:+14155238886') return;
  const msg = req.body.Body || req.body.Body;
  // eslint-disable-next-line no-console
  console.log('wh controller', fromNumber, msg, req.body);

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
        last: 'main',
      })
      .then(() => {
        msgCtrl.sendMsg({
          fromNumber,
          msg: 'Hello! What do you want?\n1. Catalogue\n2. Customer Support\n3. Order Status',
        });
      }).catch(errorHandler);
  }

  function sendCatalog() {
    retireveCollections(storeMyShopify, accessToken).then((
      response,
    ) => {
      const collections = `Select catalog:\n${
        response.collections.edges
          .map((val, idx) => `${idx + 1}. ${val.node.handle}`)
          .join('\n')}`;
      msgCtrl.sendMsg({
        fromNumber,
        msg: collections,
      });
      UserStates.updateOne(
        {
          phone: fromNumber,
        },
        {
          $set: {
            last: 'catalog',
            catalogs: response.collections.edges,
          },
        },
      );
    });
  }

  const getSupport = () => {};
  const getOrderStatus = () => {
    msgCtrl.sendMsg({
      fromNumber,
      msg: 'Type your tracking number OR email.',
    });
    UserStates.updateOne(
      {
        phone: fromNumber,
      },
      {
        $set: {
          last: 'tracking',
        },
      },
    );
  };

  function continueDialog(state) {
    if (msg.toLowerCase() === 'main') {
      msgCtrl.sendMsg({
        fromNumber,
        msg: 'Hello! What do you want?\n1. Catalogue\n2. Customer Support\n3. Order Status',
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
      );
      return;
    }

    if (state.last === 'main') {
      switch (msg) {
        case '1':
          sendCatalog();
          break;
        case '2':
          getSupport();
          break;
        case '3':
          getOrderStatus();
          break;
        default: {
          msgCtrl.sendMsg({
            fromNumber,
            msg: 'Please, send right command',
          });
          break;
        }
      }
    } else if (state.last === 'tracking') {
      if (/@/.test(msg)) {
        getAllOrders(storeMyShopify, apiVersion, storeAPIkey, storePassword)
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
          })
          .catch((err) => {
            // eslint-disable-next-line no-console
            console.log(err);
            msgCtrl.sendMsg({
              fromNumber,
              msg: 'error on creating tracking url',
            });
          });
      } else {
        const trackingUrl = `https://t.17track.net/en#nums=${msg}`;
        msgCtrl.sendMsg({
          fromNumber,
          msg: `Please open this link to track your order!\n${trackingUrl}`,
        });
      }
    } else if (state.last === 'catalog') {
      if (!state.catalogs[msg - 1]) {
        msgCtrl.sendMsg({
          fromNumber,
          msg: 'Please, send right command',
        });
        return;
      }
      const { handle } = state.catalogs[msg - 1].node;
      getProductsByCollectionHandle(storeMyShopify, accessToken, handle).then(
        (response) => {
          const products = response.collectionByHandle.products.edges;
          let txt = products
            .map((pr, idx) => `${idx + 1}. ${pr.node.handle}`)
            .join('\n');
          txt = `Select Product:\n${txt}`;

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
                last: 'products',
                products,
              },
            },
          );
        },
      );
    } else if (state.last === 'products') {
      if (!state.products[msg - 1]) {
        msgCtrl.sendMsg({
          fromNumber,
          msg: 'Please, send right command',
        });
        return;
      }

      const productID = state.products[msg - 1].node.id;
      retireveVariantsOfProduct(storeMyShopify, accessToken, productID).then(
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
                  .map((v, idx) => `${idx + 1}. ${v.node.id}`)
                  .join('\n');
                txt = `Select variants:\n${txt}`;
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
                );
              }, 3000);
            }
          });
        },
      );
    } else if (state.last === 'variants') {
      if (!state.variants[msg - 1]) {
        msgCtrl.sendMsg({
          fromNumber,
          msg: 'Please, send right command',
        });
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

      const txt = 'Your item is placed in cart.What do you want next ? \n1.Continue shopping.\n2.See my cart. \n3.Proceed to payment.';

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
      );
    } else if (state.last === 'added-to-cart') {
      switch (msg) {
        case '1':
          sendCatalog();
          break;
        case '2':
          {
            const txt = state.storedLineItems
              .filter((x) => x.title && x.quantity)
              .map(
                ({ title, quantity }, idx) => `${idx + 1}. ${title}: ${quantity}`,
              )
              .join('\n');
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
              errorHandler,
            );
          }
          break;
        case '3': {
          createCheckoutList(
            storeMyShopify,
            accessToken,
            state.storedLineItems,
          )
            .then((createdCheckoutInfo) => {
              const txt = `Congratulations! \nYour order is almost created.\nPlease, open this url and finish him!\n ${
                createdCheckoutInfo.checkoutCreate.checkout.webUrl}`;
              msgCtrl.sendMsg({
                fromNumber,
                msg: txt,
              });
              UserStates.updateOne({
                phone: fromNumber,
              },
              {
                $set: {
                  last: 'completed',
                  storedLineItems: [],
                },
              },
              errorHandler);
            });

          break; }
        default: {
          msgCtrl.sendMsg({
            fromNumber,
            msg: 'Please,send right command',
          });
          break;
        }
      }
    }
  }

  if (msg.toLowerCase() === 'discount') {
    const discountSlug = generateSlug();
    shopifyDiscountCreate(
      storeMyShopify,
      apiVersion,
      storeAPIkey,
      storePassword,
      priceRuleId,
      discountSlug,
    )
      .then((response) => {
        const { code } = response.data.discount_code;
        const discountedUrl = `http://${storeMyShopify}/discount/${code}`;

        discounts
          .insertOne({
            discountCode: discountSlug,
            phone: fromNumber,
          })
          .then(() => {
            msgCtrl.sendMsg({
              fromNumber,
              msg: `Here is your promocode: ${discountedUrl}`,
            });
          })
          .catch((err) => {
            // eslint-disable-next-line no-console
            console.log(err);
            msgCtrl.sendMsg({
              fromNumber,
              msg: 'error on creating discount',
            });
          });
      })
      .catch((err) => {
        // eslint-disable-next-line no-console
        console.log(err);
        msgCtrl.sendMsg({
          fromNumber,
          msg: 'error on creating discount',
        });
      });

    return;
  }

  UserStates
    .findOne({
      phone: fromNumber,
    })
    .then((state) => {
      if (!state) {
        createNewDialog();
      } else {
        continueDialog(state);
      }
    });
}
module.exports = {
  handleMessage,
};
