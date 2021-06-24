const MongoClient = require('mongodb').MongoClient;
const uri = "mongodb+srv://nurlan:qwe123QWE___@cluster0.ikiuf.mongodb.net/twiliodb?retryWrites=true&w=majority";
module.exports = (callback, arr) => {
    const client = new MongoClient(uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    });
    client.connect(connecionError => {
        if (connecionError) {
            console.log(connecionError)
            return;
        }
        const db = client.db("test");
        callback(db, arr, function() {
            client.close();
        });
    });
}

module.exports.getConnect = () => {
    return new MongoClient(uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    });
}