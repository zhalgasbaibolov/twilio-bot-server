const {
  ObjectId,
  MongoClient,
} = require('mongodb');

const uri = 'mongodb+srv://nurlan:qwe123QWE___@cluster0.ikiuf.mongodb.net/twiliodb?retryWrites=true&w=majority';
const express = require('express');

const router = express.Router();

router.get('/', (req, res) => {
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
    collection.find({}).toArray((err, docs) => {
      client.close();
      if (err) {
        return res.status(500).send(err);
      }
      docs.forEach((d) => d._id = d._id.toString());
      const root = docs.filter((d) => !d.parentId);
      const children = docs.filter((d) => d.parentId);

      for (const node of root) { getChildren(node, children); }

      function getChildren(n, arr) {
        n.children = arr.filter((item) => item.parentId === n._id);
        for (const node of n.children) { getChildren(node, arr); }
      }
      res.send(root);
    });
  });
});
router.post('/', (req, res, next) => {
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
    collection.insertOne(req.body, (err, result) => {
      client.close();
      if (err) {
        return res.status(500).send(err);
      }
      res.send(result.ops[0]);
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
    collection.updateOne({
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
      res.send(result.result);
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
    collection.deleteOne({
      _id: ObjectId(req.params.id),
    }, (err, result) => {
      client.close();
      if (err) {
        return res.status(500).send(err);
      }
      res.send(result.result.n);
    });
  });
});

module.exports = router;
