/*
*
*
*       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
*       -----[Keep the tests in the same order!]-----
*       (if additional are added, keep them at the very end!)
*/

var chaiHttp = require('chai-http');
var chai = require('chai');
var assert = chai.assert;
var server = require('../server');
var MDB = require('../db');

chai.use(chaiHttp);

suite('Functional Tests', function() {
    suite('Prep', function() {
      
      test('Delete all likes', function(done) {
        MDB.clearTestLikes((err,res)=> {
          console.log(err,res);
          assert.isTrue(res, 'the likes have been cleares');
          done();
        });
      });
      
    });

  
    suite('GET /api/stock-prices => stockData object', function() {
      
      test('1 stock', function(done) {
       chai.request(server)
        .get('/api/stock-prices')
        .query({stock: 'goog'})
        .end(function(err, res){
          // {"stockData":{"stock":"goog","price":"786.90","likes":1}}
          //complete this one too
          assert.equal(res.status, 200);
          assert.property(res.body, 'stockData');
          assert.nestedPropertyVal(res.body, 'stockData.stock', 'goog');
          assert.nestedProperty(res.body, 'stockData.price');
          assert.nestedPropertyVal(res.body, 'stockData.likes',0);
          done();
        });
      });
      
      test('1 stock with like', function(done) {
        chai.request(server)
        .get('/api/stock-prices')
        .query({stock: 'goog', like:'true'})
        .end(function(err, res){
          // {"stockData":{"stock":"goog","price":"786.90","likes":1}}
          //complete this one too
          assert.equal(res.status, 200);
          assert.property(res.body, 'stockData');
          assert.nestedPropertyVal(res.body, 'stockData.stock', 'goog');
          assert.nestedProperty(res.body, 'stockData.price');
          assert.nestedPropertyVal(res.body, 'stockData.likes',1);
          done();
        });  
      });
      
      test('1 stock with like again (ensure likes arent double counted)', function(done) {
        chai.request(server)
        .get('/api/stock-prices')
        .query({stock: 'goog', like:'true'})
        .end(function(err, res){
          // {"stockData":{"stock":"goog","price":"786.90","likes":1}}
          //complete this one too
          assert.equal(res.status, 200);
          assert.property(res.body, 'stockData');
          assert.nestedPropertyVal(res.body, 'stockData.stock', 'goog');
          assert.nestedProperty(res.body, 'stockData.price');
          assert.nestedPropertyVal(res.body, 'stockData.likes',1);
          done();
        });   
      });
      
      test('2 stocks', function(done) {
        chai.request(server)
        .get('/api/stock-prices')
        .query({stock: ['goog','msft']})
        .end(function(err, res){
          // {"stockData":{"stock":"goog","price":"786.90","likes":1}}
          //complete this one too
          assert.equal(res.status, 200);
          assert.property(res.body, 'stockData');
          assert.isArray(res.body.stockData);
          //checks 1st stock data
          assert.nestedPropertyVal(res.body, 'stockData[0].stock', 'goog');
          assert.nestedProperty(res.body, 'stockData[0].price');
          assert.nestedPropertyVal(res.body, 'stockData[0].rel_likes',1);
          //checks 2nd stock
          assert.nestedPropertyVal(res.body, 'stockData[1].stock', 'msft');
          assert.nestedProperty(res.body, 'stockData[1].price');
          assert.nestedPropertyVal(res.body, 'stockData[1].rel_likes',-1);
          done();
        });          
      });
      
      test('2 stocks with like', function(done) {
        chai.request(server)
        .get('/api/stock-prices')
        .query({stock: ['goog','msft'], like: true})
        .end(function(err, res){
          // {"stockData":{"stock":"goog","price":"786.90","likes":1}}
          //complete this one too
          assert.equal(res.status, 200);
          assert.property(res.body, 'stockData');
          assert.isArray(res.body.stockData);
          //checks 1st stock data
          assert.nestedPropertyVal(res.body, 'stockData[0].stock', 'goog');
          assert.nestedProperty(res.body, 'stockData[0].price');
          assert.nestedPropertyVal(res.body, 'stockData[0].rel_likes',0);
          //checks 2nd stock
          assert.nestedPropertyVal(res.body, 'stockData[1].stock', 'msft');
          assert.nestedProperty(res.body, 'stockData[1].price');
          assert.nestedPropertyVal(res.body, 'stockData[1].rel_likes',0);
          done();
        });           
      });
      
    });

});
