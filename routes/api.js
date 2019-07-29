/*
*
*
*       Complete the API routing below
*
*
*/

'use strict';

var expect = require('chai').expect;
var MongoClient = require('mongodb');
var axios = require('axios');
var MDB = require('../db');
const API_PUBLISH = process.env.API_PUBLISH;
const CONNECTION_STRING = process.env.DB; //MongoClient.connect(CONNECTION_STRING, function(err, db) {});

module.exports = function (app) {

  function getCallerIP(request) {
    var ip = request.headers['x-forwarded-for'] ||
        request.connection.remoteAddress ||
        request.socket.remoteAddress ||
        request.connection.socket.remoteAddress;
    ip = ip.split(',')[0];
    ip = ip.split(':').slice(-1); //in case the ip returned in a format: "::ffff:146.xxx.xxx.xxx"
    return ip;
  }
  
  function insertLike(ip,symbol, like, done){
    var db=MDB.get();
    if (like) {
      db.collection('stocks').findOneAndUpdate(
        { stock: symbol, ip: ip },
        { $set: { ip: ip}},
        {upsert: true}, function(err, res) { done(err, res); }) //No need to do anything here the calling function checks for errors
    }else {
      //si no estaba like da null null pero no hay error.
      done(null,null);
    } 
    
  }
  
  
  function getLikes(ip, symbol, like, done){
      var db=MDB.get();
      
      insertLike(ip, symbol, like, (err, res)=>{
        if (err) {
          //si hay error al insertar like, lo lanzo e informo
          console.log('Error proveniente de insertLike: ' + err);
          return done(err, null);
        }
        db.collection('stocks').aggregate([
          { $match: { stock: symbol } }, 
          { $group: { _id : "$stock", likes: { $sum: 1 } } }]
        ).toArray((err, doc) => {
          if(err) {
          //si hay error al get likes, lo lanzo e informo
            console.log('debug: ERROR en getLikes')
            return done(err);
          } else {
            //No hay error, lo proceso
            if (doc.length==0){
              return done(null, 0);
            }
            return done(err, doc[0].likes);
          }
      }); 
      })
  
  }
  
  function processStock(ip, symbol, like, done){
      let symbObj={stock: symbol};
      //Primero consigo el precio de la accion (y de paso valido que exista)
      axios.get('https://cloud.iexapis.com/stable/stock/'+ symbol +'/quote/latestPrice?token\=' + API_PUBLISH )
      .then(response => {

      symbObj.price=response.data; // agrego al objeto symb el valor de la accion
      try{
        getLikes(ip, symbol , like, (err, likes)=>{
          if (err) {
            console.log('Error from getLikes: ', err);
            done(err);
          }
          symbObj.likes=likes;
          done(err, symbObj)
      })}catch(err){
         console.log('crap');       
      }})
    
    .catch(err => {
        if (err.response.data=='Unknown symbol'){
          //if STOCK Symbol not found
          return done('Unknown symbol', null);
        }
        console.log('Error en el query a la api de finanzas')
        return done(err)
    })
  }
  
  app.route('/api/stock-prices')
    .get(function (req, res){
    
    let remoteIP=getCallerIP(req)[0];
    
    let like=req.query.like=='true'?true:false; 
    
    if (!req.query.stock) {
      //Si no mandan stock
      return res.json({message: 'missing stock parameter'})
    } else if (!Array.isArray(req.query.stock)){
        //Es uno solo stock
        //Proceso el stock
        processStock(remoteIP, req.query.stock, like,(err,symb)=> {
          if (err) {
            //Si el symbol es desconocido aviso
            if (err=='Unknown symbol') return res.json({message: 'Unknown stock symbol'+req.query.stock})
            console.log('error: ', err);
          }
          //Si todo OK, respondo
          return res.json({ stockData:{stock: symb.stock, price: symb.price, likes: symb.likes}});
        });
    } else{
        //Si son 2 stock
        //proceso el primero
        processStock(remoteIP, req.query.stock[0],like,(err,symb1)=> {
          if (err) {
            //si el primero es desconocido notifico via json
            if (err=='Unknown symbol') return res.json({message: 'Unknown stock symbol'+ req.query.stock[0]})
            console.log('error: ', err);
          }
          //proceso el segundo
          processStock(remoteIP, req.query.stock[1],like,(err,symb2)=> {
            if (err) {
              //si el segundo es desconocido notifico via json
              if (err=='Unknown symbol') return res.json({message: 'Unknown stock symbol'+ req.query.stock[1]})
              console.log('error: ', err);
            }
            //Si todo OK respondo
            return res.json({ stockData:[{stock: symb1.stock, price: symb1.price, rel_likes: symb1.likes-symb2.likes},
                                         {stock: symb2.stock, price: symb2.price, rel_likes: symb2.likes-symb1.likes}]})            
          });
        });
    }});
    
};
