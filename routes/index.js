var express = require('express');
var router = express.Router();
var http = require('https');
var data = '';
var markets = [];
var stats;
var UPDATE_TIMER = 10000;

var options = {
  host: "api.mintpal.com",
  path: '/v1/market/summary/',
  port: 443,
  method: 'GET'
};

var stat_options = {
  host: "api.mintpal.com",
  path: '/v1/market/stats/',
  port: 443,
  method: 'GET'
};

http.request(options, function(res) {
  res.setEncoding('utf8');
  res.on('data', function (chunk) {
    data += chunk.toString();
  });
  res.on('end', function() {
    var responseObject = JSON.parse(data);
    for(var i = 0; i < responseObject.length; i++){
      var market = responseObject[i];
      markets.push(market);
    }
    setupMarkets();
  });
}).end()

/* GET home page. */
router.get('/', function(req, response) {
  response.render('index', { title: 'MintPal Overview',
                             markets: markets });
});

setInterval(function() {
  markets.length = 0;
  data = '';
  http.request(options, function(res) {
  res.setEncoding('utf8');
  res.on('data', function (chunk) {
    data += chunk.toString();
  });
  res.on('end', function() {
    var responseObject = JSON.parse(data);
    for(var i = 0; i < responseObject.length; i++){
      var market = responseObject[i];
      markets.push(market);
    }
    setupMarkets();
  });
  }).end()
}, UPDATE_TIMER );

function setupMarkets(){
  for(var i = 0; i < markets.length; i++){
    /* GET markets */
    var market = markets[i];
    router.get('/' + i, function(req, response) {
      var num = req.url.slice(1,req.url.length);
      console.log(num);
      var market = markets[num];
      var stats = '';
      stat_options.path = '/v1/market/trades/' + market.code + '/' + market.exchange;
      http.request(stat_options, function(res) {
        res.setEncoding('utf8');
        res.on('data', function (chunk) {
          stats += chunk.toString();
        });
        res.on('end', function() {
          //stats += ']';
          response.render('market', { market: market, stats: stats });
        });
      }).end()
    });
  }
}

module.exports = router;
