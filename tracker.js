const { getAbandonedCart } = require("./cartAbandonment")
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
                const allCarts = [
                    { discount: 'abc' },
                    { discount: 'abcde' }, { discount: 'adwwbc' }, { discount: 'wwsdfadbc' }];
                const ourDiscounts = [
                    { discount: 'abc', phone: '+77078629827' },
                    { discount: 'adwwbc', phone: '+7777234123' },
                    { discount: 'dededed', phone: '+733534342' }
                ];
                for (let j = 0; j < ourDiscounts.length; j++) {
                    for (let i = 0; i < allCarts; i++) {
                        if (ourDiscounts[j].discount == allCards[i].discount) {
                            console.log(`user ${ourDiscounts[j].phone} abandoned cart with ${allCarts[i].discount} discount`)
                        } 
                    }
                }
            }
            else {
                console.log(response)
            }
        })
}, 2000)