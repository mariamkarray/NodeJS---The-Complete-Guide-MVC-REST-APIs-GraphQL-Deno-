const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;

// the _ indicates that it will only be used in this file
let _db;

const mongoConnect = (callback) => {
    MongoClient.connect(
        'mongodb+srv://Mariam:22618166@cluster0.2szm7sk.mongodb.net/?retryWrites=true'
        )
    .then(client => {
        console.log('Connected!');
        _db = client.db(); // store access to db, 'test' by default, will keep on running
        callback();
    })
    .catch(err => {
        console.log(err)
        throw err;
    });
}

const getDb = () => {
    // if its not undefined
    if (_db) {
        return _db // return the access
    }
    throw 'No database found!'
}
// connecting and storing the connection to the database
exports.mongoConnect = mongoConnect;

// retrieve established connection, if it exists
exports.getDb = getDb;