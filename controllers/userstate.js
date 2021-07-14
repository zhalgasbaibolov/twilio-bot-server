const Userstate = require('../db/models/Userstate');

exports.create = (req, res) => {
  if (!req.body.From) {
    return;
  }

  const userstate = new Userstate({
    From: req.body.From,
  });

  userstate
    .save(userstate)
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.sendStatus(500).send(err);
    });
};