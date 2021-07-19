const { MongoClient } = require('mongodb');

const uri = 'mongodb+srv://nurlan:qweQWE123@cluster0.ikiuf.mongodb.net/twiliodb?retryWrites=true&w=majority';
module.exports = (callback, arr) => {
  const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  client.connect((connecionError) => {
    if (connecionError) {
      console.log(connecionError);
      return;
    }
    const db = client.db('test');
    callback(db, arr, () => {
      client.close();
    });
  });
};

module.exports.getConnect = () => new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
