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
        try {
            const fromNumber = req.body.From || req.body['From'];
            if ('whatsapp:+14155238886' === fromNumber)
                return res.sendStatus(200)
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
                            return res.status(200).send(connecionError)
                        }
                        const db = client.db("test");
                        const userStates = db.collection('userStates');
                        userStates.findOne({
                                phone: fromNumber
                            }).then(state => {
                                    if (!state) {
                                        userStates.insertOne({
                                            phone: fromNumber,
                                            last: 'main'
                                        }).then(inserted => {
                                            msgCtrl.sendMsg({
                                                fromNumber,
                                                msg: `
                                Hello! What do you want?
                                1. Catalogue
                                2. Customer Support
                                3. Order Status
                                `
                                            })
                                            client.close();
                                        })
                                    } else {
                                        let txt = '';
                                        if (state.last == 'main') {
                                            switch (msg) {
                                                case '1':
                                                    retireveCollections(storeMyShopify, accessToken).then(response => {
                                                        const collections = "Select catalog:\n" + response.collections.edges.map((val, idx) => `${idx+1}. ${val.node.handle}`).join('\n')
                                                        res.send(collections);
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
                                                    break;
                                                case '2':
                                                    txt = getSupport(res, msgCtrl);
                                                    break;
                                                case '3':
                                                    txt = getOrderStatus(res, msgCtrl);
                                                    break;
                                                default:
                                                    break;
                                            }
                                        } else if (state.last == 'catalog') {
                                            const handle = state.catalogs[msg].node.handle;
                                            getProductsByCollectionHandle(storeMyShopify, accessToken, handle).then(response => {
                                                        const products = response.collectionByHandle.products.edges;
                                                        const txt = `Select Product:\n${products.map((pr,idx)=>`${idx+1}. ${pr.node.handle}`).join('\n')}`
                                                        res.send(collections);
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
                        }
                    }
                })
                .catch(err => {
                    msgCtrl.sendMsg({
                        fromNumber,
                        msg: 'err1'
                    })
                    return res.status(200).send(err)
                })
        });
    } catch (err) {
        msgCtrl.sendMsg({
            fromNumber,
            msg: 'JSON.stringify(err)'
        })
        return res.status(200).send(err)
    }

}
const getSupport = (res, msgCtrl) => {

}
const getOrderStatus = (res, msgCtrl) => {

}
module.exports = {
    msg
};