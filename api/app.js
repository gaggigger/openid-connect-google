var express = require('express');
var util = require('util');
var morgan = require('morgan');
var bodyParser   = require('body-parser');
var querystring  = require('query-string');
var verify = require('./api_verify_token');


var client = '';
var queryq = {};
var publishChannel = {};

var googleEndpoints = {};
var googleKeys = {};
// Make this array persistent
var keyArray = {};

// Set the following to match your client
var GOOGLE_CLIENT_ID = "";

var gOptions = {
  "GOOGLE_OPENID_CONFIG_LINK" : "https://accounts.google.com/.well-known/openid-configuration"
};

var usrArray =  [
                  {id: "User1", name: "John Smith", type: "normalPerson"},
                  {id: "User2", name: "Jane Popular", type: "normalPerson"},
                  {id: "User3", name: "Amanda Spiderman", type: "superPerson"},
                  {id: "User4", name: "Jake Hulk", type: "superPerson"}
                ];

var userDetails = [
                    {id: 'User1', details : {title1 : 'Title1 John Smith', title2 : 'Title2 John Smith'}},
                    {id: 'User2', details : {title1 : 'Title1 Jane Popular', title2 : 'Title2 Jane Popular'}},
                    {id: 'User3', details : {title1 : 'Title1 Amanda Spiderman', title2 : 'Title2 Amanda Spiderman'}},
                    {id: 'User4', details : {title1 : 'Title1 Jake Hulk', title2 : 'Title2 Jake Hulk'}}
                  ];

var employer = [
                    {id: 'User1', details : {name : 'Acme Inc', address : 'Maple Street, Anytown USA'}},
                    {id: 'User2', details : {name : 'Brown Inc', address : 'Walnut Street, Nuttown USA'}},
                    {id: 'User3', details : {name : 'Cesium Inc', address : 'Birch Rd, Treetown USA'}},
                    {id: 'User4', details : {name : 'Druker Inc', address : 'Oak Street, Furniture Town USA'}}
                ];

var address = [
                    {id: 'User1', details : {address1 : 'User1 Street', address2 : 'Maple Street', city : "Anytown", zip: "11111"}},
                    {id: 'User2', details : {address1 : 'User2 Street', address2 : 'Walnut Street', city : "Nuttown", zip: "22222"}},
                    {id: 'User3', details : {address1 : 'User3 Street', address2 : 'Birch Rd', city : "Treetown", zip: "33333"}},
                    {id: 'User4', details : {address1 : 'User4 Street', address2 : 'Oak Street', city : "Furniture Town", zip: "44444"}}
                ];

var children = [
                    {
                      id: 'User1', details : { children : [
                                                          { name : 'U1 Child1', age : '5', gender : 'Male'},
                                                          { name : 'U1 Child2', age : '7', gender : 'Female'}
                                                          ]
                                               }
                    },
                    {
                      id: 'User2', details : { children : [
                                                          { name : 'U2 Child1', age : '5', gender : 'Male'},
                                                          { name : 'U2 Child2', age : '7', gender : 'Female'}
                                                          ]
                                              }
                    },
                    {
                      id: 'User3', details : { children : [
                                                          { name : 'U3 Child2', age : '5', gender : 'Male'},
                                                          { name : 'U3 Child2', age : '7', gender : 'Female'}
                                                          ]
                                              }
                    },
                    {
                      id: 'User4', details : { children : [
                                                          { name : 'U4 Child2', age : '5', gender : 'Male'},
                                                          { name : 'U4 Child2', age : '7', gender : 'Female'}
                                                          ]
                                              }
                    }
                  ];

var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// When testing on localhost - the following code may has to be enabled, can be commented out 
// when using nginx to front this server
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.use(morgan('dev'));

// Silence the favicon request sent by all browsers automatically
app.get('/favicon.ico', function(req, res) {
	res.send('200OK');
});

verify.updateKeyList(gOptions, googleEndpoints, keyArray);

app.use(function verifyUser(req, res, next) {

  req.userInfoFromToken = {};
  if (req.query.Token) {
    verify.verifyToken(req.query.Token, gOptions, googleEndpoints, keyArray, function (err, decoded) {
        if (err) {
          console.log({"Verification Error" : err});
          res.sendStatus(403);
        } else {
          // Check if audience requested is same as the client Id
          if (decoded.aud != GOOGLE_CLIENT_ID) {
            console.log("Invalid audience = " + decoded.aud);
            res.sendStatus(403);
          }
          req.userInfoFromToken = decoded;
          next();
        }
    });
  } else {
    console.log("Token not present - 403 Forbidden error");
    res.sendStatus(403);
  }
});

// Returns a list of all users
app.get('/users', function(req,res) {
  var initObj = {
                  'users' : usrArray,
                  'email' : req.userInfoFromToken.email
                };
	res.json(initObj);
});

findIndex = function(id, obj) {
  for (var i=0; i < obj.length;i++) {
    if (obj[i].id == id) {
      return i;
    }
  }
  return (-1);
};

app.get('/:u_id/details', function(req,res) {
  var i = findIndex(req.params.u_id, userDetails);
  if (i < 0) res.json("{error : 'User details not found'}");
  var msg = userDetails[i].details;
  res.json(msg);
});

app.get('/:u_id/address', function(req,res) {
  var i = findIndex(req.params.u_id, address);
  if (i < 0) res.json("{error : 'User address not found'}");
  var msg = address[i].details;
  res.json(msg);
});

app.get('/:u_id/employer', function(req,res) {
  var i = findIndex(req.params.u_id, employer);
  if (i < 0) res.json("{error : 'Employer not found'}");
  var msg = employer[i].details;
  res.json(msg);
});

app.get('/:u_id/children', function(req,res) {
  var i = findIndex(req.params.u_id, children);
  if (i < 0) res.json("{error : 'Children not found'}");
  var msg = children[i].details.children;
  res.json(msg);
});

app.listen(5003);
