const Userstate = require('../db/models/Userstate');

exports.create = (req, res) => {
  // Validate request
  if (!req.body.From) {
    return;
  }

  // Create
  const userstate = new Userstate({
    From: req.body.From,
  });

  // Save in the database
  userstate
    .save(userstate)
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      console.log('error');
      res.sendStatus(500);
    });
};
