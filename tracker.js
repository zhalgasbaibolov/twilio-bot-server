const getConnect = require('../db/mongo').getConnect;
const msgCtrl = require('./controllers/msg')
const {
    getAbandonedCart
} = require("./cartAbandonment")
const accessToken = "0386d977a264448a1b62c295ac542a0d";
const storeAPIkey = "0f6b58da9331414de7ed1d948c67ac35";
const storePassword = "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";
const storeMyShopify = "fat-cat-studio.myshopify.com";
const apiVersion = "2021-04";
const created_at_min = "2021-07-07T07:05:27-04:00";

setInterval(() => {
    getAbandonedCart(
            storeMyShopify,
            apiVersion,
            storeAPIkey,
            storePassword,
            created_at_min
        )
        .then(response => {
            if (!response) {
                return;
            }
            const allCarts = response.data.checkouts;
            if (!allCarts || !allCarts.length) {
                console.log('abandoned carts not found');
                return;
            }

            const client = getConnect();
            client.connect(connecionError => {
                if (connecionError) {
                    console.log(connecionError)
                    return;
                }
                const db = client.db("test");
                const discounts = db.collection('discounts');
                discounts.find({}).then(pairs => {
                    if (!pairs || !pairs.length) {
                        console.log('phone:discount pairs not found');
                        return;
                    }
                    allCarts.forEach(cart => {
                        for (let i = 0; i < cart.discount_codes.length; i++) {
                            const code = cart.discount_codes[i];
                            const findedPair = pairs.find(p => p.discountCode == code)
                            if (!findedPair)
                                continue;
                            msgCtrl.sendMsg({
                                fromNumber: findedPair.phone,
                                msg: `Please, complete your purchase!\n${cart.abandoned_checkout_url}`
                            })
                            return;
                        }
                    });
                }).catch(err => {
                    console.log(err);
                })
            });
            const ourDiscounts = [{
                discountCode: 'abc',
                phone: '+77078629827'
            }];
        })
}, 3000)