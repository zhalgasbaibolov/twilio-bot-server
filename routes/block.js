const {
  ObjectId,
  MongoClient,
} = require('mongodb');

const uri = 'mongodb+srv://nurlan:qwe123QWE___@cluster0.ikiuf.mongodb.net/twiliodb?retryWrites=true&w=majority';
const express = require('express');

const router = express.Router();

router.get('/', (req, res) => {
  res.send('blocks');
});
router.post('/', (req, res) => {
  const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  client.connect((connecionError) => {
    if (connecionError) {
      return res.status(500).send(connecionError);
    }
    const db = client.db('test');
    const collection = db.collection('blocks');
    return collection.insertOne(req.body, (err, result) => {
      client.close();
      if (err) {
        return res.status(500).send(err);
      }
      return res.send(result.ops[0]);
    });
  });
});

router.put('/:id', (req, res) => {
  console.log(`updating id:${JSON.stringify(req.body)}`);
  const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  client.connect((connecionError) => {
    if (connecionError) {
      console.log(connecionError);
      return res.status(500).send(connecionError);
    }
    const db = client.db('test');
    const collection = db.collection('blocks');
    return collection.updateOne({
      _id: ObjectId(req.params.id),
    }, {
      $set: {
        name: req.body.name,
      },
    }, (err, result) => {
      client.close();
      if (err) {
        console.error(err);
        return res.status(500).send(err);
      }
      return res.send(result.result);
    });
  });
});

router.delete('/:id', (req, res) => {
  const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  client.connect((connecionError) => {
    if (connecionError) {
      console.log(connecionError);
      return res.status(500).send(connecionError);
    }
    const db = client.db('test');
    const collection = db.collection('blocks');
    return collection.deleteOne({
      _id: ObjectId(req.params.id),
    }, (err, result) => {
      client.close();
      if (err) {
        return res.status(500).send(err);
      }
      return res.send(result.result.n);
    });
  });
});

module.exports = router;
