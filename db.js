//const mongoClient = require('mongodb').MongoClient;

var MongoClient = require('mongodb');
var ObjectId = require('mongodb').ObjectID;
const CONNECTION_STRING = process.env.DB; 

let mongodb;

function connect(done){
  MongoClient.connect(CONNECTION_STRING, { useNewUrlParser: true }, (err, client) => {
    if(err) {
        console.log('Database error: ' + err);
        done(err);
    } else {
        console.log('Successful database connection');
        mongodb = client.db('stock-checkr');
        done();
    }
  });
}

function get(){
    if (mongodb===null) {
      console.log('Trying to get uninitialized DB');
      return null;
    }else{
      return mongodb;
    }
}

function clearTestLikes(done){
    if (mongodb===null) {
      console.log('Trying to clear uninitialized DB');
      return null;
    }else{
      mongodb.collection('stocks').deleteMany({ stock: { $in: ['goog', 'msft'] } },(err, doc) => {
          if(err) {
              console.log('could not perform complete delete', err);
              return done(err, false);
          } else {
              console.log('complete delete successful');
              return done(err, true);
          }
      });
    }  
}

function close(){
    mongodb.close();
}



module.exports = {
    connect,
    get,
    close,
    clearTestLikes
};