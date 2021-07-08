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

        const errorHandler = (err) => {
            console.log(err)
            msgCtrl.sendMsg({
                fromNumber,
                msg: JSON.stringify(err)
            })
            return res.status(200).send(err)
        }
        const closeConnection = (err) => {
            client.close();
            if (err) {
                console.error(err)
            }
        }

        const fromNumber = req.body.From || req.body['From'];
        if ('whatsapp:+14155238886' === fromNumber)
            return res.sendStatus(200)
        const msg = req.body.Body || req.body['Body'];
        console.log('wh controller', fromNumber, msg, req.body)


        const onConnect = () => {
            const db = client.db("test");
            const userStates = db.collection('userStates');

            userStates.findOne({
                    phone: fromNumber
                }).then(state => {
                    if (!state) {
                        createNewDialog();
                    } else {
                        continueDialog();
                    }
                })
                .catch(errorHandler)
        }


        const createNewDialog = () => {
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
            res.send("ok");
        }

        const continueDialog = () => {
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
                    }, (err) => closeConnection(err, client));
                    return res.send("main")
                }
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
                            getSupport(res, msgCtrl);
                            break;
                        case '3':
                            getOrderStatus(res, msgCtrl);
                            break;
                        default:
                            break;
                    }
                } else if (state.last == 'catalog') {
                    const handle = state.catalogs[msg - 1].node.handle;
                    getProductsByCollectionHandle(storeMyShopify, accessToken, handle)
                        .then(response => {
                                const products = response.collectionByHandle.products.edges;
                                const txt = `Select Product:\n${products.map((pr,idx)=>`${idx+1}. ${pr.node.handle}`).join('\n')}`
        res.send(products);
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
}else if(state.last == 'products'){
const productID = state.products[msg-1].node.id;
retireveVariantsOfProduct(storeMyShopify, accessToken, productID)
.then(response=>{
const variants = response.node.variants.edges;
const txt = `Select variants:\n${
    variants.map((v,idx)=>`${idx+1}. ${v.node.id}`).join('\n')
}`
res.send(variants);
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
}else if(state.last == 'variants'){
if(!state.lastCheckoutId) {
const variantID = state.variants[msg-1].node.id;
createCheckout(storeMyShopify, accessToken,variantID).then(createdCheckoutId=>{
const txt =`Your item is placed in cart. What do you want next?\n1. Continue shopping.\n2. Proceed to payment.`

msgCtrl.sendMsg({
    fromNumber,
    msg: txt
})  
userStates.updateOne({
    phone: fromNumber
}, {
    $set: {
        last: 'added-to-cart',
        lastCheckoutId: createdCheckoutId
    } 
}, function(err, result) {
    client.close();
    if (err) {
        console.error(err)
    }
});
return res.sendStatus(200);
}).catch(err=>{
msgCtrl.sendMsg({
    fromNumber,
    msg: JSON.stringify(err)
})
return res.sendStatus(200);
})

} else {
updateCheckout(storeMyShopify, accessToken,lastCheckoutId, variantID).then(updatedCheckoutId=>{
const txt =`Your item is placed in cart. What do you want next?\n1. Continue shopping.\n2. Proceed to payment.`

msgCtrl.sendMsg({
    fromNumber,
    msg: txt
})  
userStates.updateOne({
    phone: fromNumber
}, {
    $set: {
        last: 'added-to-cart',
        lastCheckoutId: updatedCheckoutId
    } 
}, function(err, result) {
    client.close();
    if (err) {
        console.error(err)
    }
});
return res.sendStatus(200);
})
}
}else if(state.last == 'added-to-cart'){
switch(msg){
case '1':{
const txt = `What do you want?\n1. Catalogue\n2. Customer Support\n3. Order Status`
res.send('redirecting to menu');
msgCtrl.sendMsg({
    fromNumber,
    msg: txt
})
userStates.updateOne({
    phone: fromNumber
}, {
    $set:{
        last: 'main'
    }
}, function(err, result) {
    client.close();
    if (err) {
        console.error(err)
    }
});
}break;
case '2':{
// createCheckout(storeMyShopify, accessToken, variantID)
// .then(response=>{
    const txt = `Congratulations! Your order is almost created.\nPlease, open this url and finish him!\n`;
    res.send('Redirecting to catalogue');
    msgCtrl.sendMsg({
        fromNumber,
        msg: txt
    })
    userStates.updateOne({
        phone: fromNumber
    }, {
        $set: {
            last: 'checkout',
            checkoutCreate:response.checkoutCreate
        }
    }, function(err) {
        client.close();
        if (err) {
            console.error(err)
        }
    });
// })
}break;
}
}
}

const getSupport = (res, msgCtrl) => {

}
const getOrderStatus = (res, msgCtrl) => {

}
 
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
    onConnect();
});

}
module.exports = {
    msg
};