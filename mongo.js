const mongoose = require('mongoose');
mongoose.connect('mongodb+srv://nurlan:qwe123QWE___@cluster0.ikiuf.mongodb.net/twiliodb?retryWrites=true&w=majority', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
    console.log('opened')
});