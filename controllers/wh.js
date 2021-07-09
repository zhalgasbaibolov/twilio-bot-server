const getConnect = require('../db/mongo').getConnect;
const msgCtrl = require('../controllers/msg')

const accessToken = "0386d977a264448a1b62c295ac542a0d";
const storeMyShopify = "fat-cat-studio.myshopify.com";
const {
    retireveCollections,
    createCheckout,
    retireveProducts,
    getProductsByCollectionHandle,
    retireveVariantsOfProduct,
} = require("./storefrontAPI");

const msg = function(req, res) {
    res.status(200).send("");

    const fromNumber = req.body.From || req.body['From'];
    if ('whatsapp:+14155238886' === fromNumber)
        return;
    const msg = req.body.Body || req.body['Body'];
    console.log('wh controller', fromNumber, msg, req.body)


    const client = getConnect();
    client.connect(connecionError => {
        if (connecionError) {
            console.log(connecionError)
            msgCtrl.sendMsg({
                fromNumber,
                msg: 'connecionError'
            })
            return;
        }
        onConnect();
    });


    const errorHandler = function(err) {
        console.log(err)
        msgCtrl.sendMsg({
            fromNumber,
            msg: JSON.stringify(err)
        })
    }

    const closeConnection = function(err) {
        client.close();
        if (err) {
            console.error(err)
        }
    }

    function onConnect() {

        function createNewDialog() {
            userStates.insertOne({
                phone: fromNumber,
                last: 'main'
            }).then(() => {
                msgCtrl.sendMsg({
                    fromNumber,
                    msg: `Hello! What do you want?\n1. Catalogue\n2. Customer Support\n3. Order Status`
                })
                client.close();
            })
        }

        function sendMainMenu() {
            retireveCollections(storeMyShopify, accessToken).then(function(response) {
                const collections = "Select catalog:\n" + response.collections.edges.map((val, idx) => `${idx+1}. ${val.node.handle}`).join('\n')
                msgCtrl.sendMsg({
                    fromNumber,
                    msg: collections
                })
                userStates.updateOne({
                    phone: fromNumber
                }, {
                    $set: {
                        last: 'catalog',
                        catalogs: response.collections.edges
                    }
                }, function(err, result) {
                    client.close();
                    if (err) {
                        console.error(err)
                    }
                });
            })
        }



        const getSupport = () => {

        }
        const getOrderStatus = () => {

        }


        function continueDialog(state) {
            if (msg.toLowerCase() == 'main') {
                msgCtrl.sendMsg({
                    fromNumber,
                    msg: `Hello! What do you want?\n1. Catalogue\n2. Customer Support\n3. Order Status`
                })
                userStates.updateOne({
                    phone: fromNumber
                }, {
                    $set: {
                        last: 'main',
                    }
                }, closeConnection);
                return;
            }
            if (state.last == 'main') {
                switch (msg) {
                    case '1':
                        sendMainMenu();
                        break;
                    case '2':
                        getSupport();
                        break;
                    case '3':
                        getOrderStatus();
                        break;
                    default:
                        msgCtrl.sendMsg({
                            fromNumber,
                            msg: 'Please, send right command'
                        })
                        break;
                }
            } else if (state.last == 'catalog') {
                if (!state.catalogs[msg-1]){
                    msgCtrl.sendMsg({
                        fromNumber,
                        msg: 'Please, send right command'
                    })
                    return
                }
                const handle = state.catalogs[msg - 1].node.handle;
                getProductsByCollectionHandle(storeMyShopify, accessToken, handle)
                    .then(response => {
                        const products = response.collectionByHandle.products.edges;
                        let txt = products.map((pr, idx) => `${idx+1}. ${pr.node.handle}`).join('\n');
                        txt = `Select Product:\n` + txt;

                        msgCtrl.sendMsg({
                            fromNumber,
                            msg: txt
                        })
                        userStates.updateOne({
                            phone: fromNumber
                        }, {
                            $set: {
                                last: 'products',
                                products: products
                            }
                        }, function(err, result) {
                            client.close();
                            if (err) {
                                console.error(err)
                            }
                        });
                    })
            } else if (state.last == 'products') {
                if (!state.products[msg-1]){
                    msgCtrl.sendMsg({
                        fromNumber,
                        msg: 'Please, send right command'
                    })
                    return
                }
                const productID = state.products[msg - 1].node.id;
                retireveVariantsOfProduct(storeMyShopify, accessToken, productID)
                    .then(response => {
                        const variants = response.node.variants.edges;
                        let txt = variants.map((v, idx) => `${idx+1}. ${v.node.id}`).join('\n');
                        txt = "Select variants:\n" + txt;

                        msgCtrl.sendMsg({
                            fromNumber,
                            msg: txt
                        })
                        userStates.updateOne({
                            phone: fromNumber
                        }, {
                            $set: {
                                last: 'variants',
                                variants: variants
                            }
                        }, function(err, result) {
                            client.close();
                            if (err) {
                                console.error(err)
                            }
                        });
                    })
            } else if (state.last == 'variants') {
                if (!state.lastCheckoutId) {
                    if (!state.variants[msg-1]){
                        msgCtrl.sendMsg({
                            fromNumber,
                            msg: 'Please, send right command'
                        })
                        return
                    }
                    const variantID = state.variants[msg - 1].node.id;
                    createCheckout(storeMyShopify, accessToken, variantID).then(createdCheckoutInfo => {
                        const txt = `
                            Your item is placed in cart.What do you want next ? \n1.Continue shopping.\n2.Proceed to payment.
                            `

                        msgCtrl.sendMsg({
                            fromNumber,
                            msg: txt
                        })
                        userStates.updateOne({
                            phone: fromNumber
                        }, {
                            $set: {
                                last: 'added-to-cart',
                                lastCheckoutInfo: createdCheckoutInfo
                            }
                        }, function(err, result) {
                            client.close();
                            if (err) {
                                console.error(err)
                            }
                        });
                    }).catch(err => {
                        msgCtrl.sendMsg({
                            fromNumber,
                            msg: JSON.stringify(err)
                        })
                    })

                } else {
                    updateCheckout(storeMyShopify, accessToken, lastCheckoutInfo, variantID).then(updatedCheckoutId => {
                        const txt = `
                            Your item is placed in cart.What do you want next ? \n1.Continue shopping.\n2.Proceed to payment.
                            `

                        msgCtrl.sendMsg({
                            fromNumber,
                            msg: txt
                        })
                        userStates.updateOne({
                            phone: fromNumber
                        }, {
                            $set: {
                                last: 'added-to-cart',
                                lastCheckoutInfo: updatedCheckoutId
                            }
                        }, function(err, result) {
                            client.close();
                            if (err) {
                                console.error(err)
                            }
                        });
                    })
                }
            } else if (state.last == 'added-to-cart') {
                switch (msg) {
                    case '1':
                        {
                            const txt = `
                            What do you want ? \n1.Catalogue\ n2.Customer Support\ n3.Order Status `
                            msgCtrl.sendMsg({
                                fromNumber,
                                msg: txt
                            })
                            userStates.updateOne({
                                phone: fromNumber
                            }, {
                                $set: {
                                    last: 'main'
                                }
                            }, function(err, result) {
                                client.close();
                                if (err) {
                                    console.error(err)
                                }
                            });
                        }
                        break;
                    case '2':
                        {
                            // createCheckout(storeMyShopify, accessToken, variantID)
                            // .then(response=>{
                            const txt = `
                            Congratulations!
                            Your order is almost created.\nPlease, open this url and finish him!\n `;
                            msgCtrl.sendMsg({
                                fromNumber,
                                msg: txt
                            })
                            userStates.updateOne({
                                phone: fromNumber
                            }, {
                                $set: {
                                    last: 'checkout',
                                    checkoutCreate: response.checkoutCreate
                                }
                            }, function(err) {
                                client.close();
                                if (err) {
                                    console.error(err)
                                }
                            });
                            // })
                        }
                        break;
                }
            }
        }
        const db = client.db("test");
        const userStates = db.collection('userStates');

        userStates.findOne({
                phone: fromNumber
            }).then(function(state) {
                if (!state) {
                    createNewDialog();
                } else {
                    console.log('continueDialog')
                    continueDialog(state);
                }
            })
            .catch(errorHandler)
    }

}
module.exports = {
    msg
};