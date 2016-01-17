var util = require('util');
var logger       = require('morgan');
var https = require('https');
var request = require('request');
var getPem = require('rsa-pem-from-mod-exp');
var jwt = require('jsonwebtoken');

function get(url) {
  return new Promise(function (resolve, reject) {
    request(url, function(error, response) {
        if (error) {
          // console.log("Error getting links");
          reject(error);
        }
        if(response.statusCode!=200) {
          // console.log("BAD Status : " + response.statusCode);
          reject(response);
        } else {
          resolve(response);
        }
    });
  });
}

function getLinks(loptions, gendpoints) {
  return new Promise(function (resolve, reject) {
    get(loptions.GOOGLE_OPENID_CONFIG_LINK)
    .then(function(response) {
      gendpoints = JSON.parse(response.body);
      resolve(gendpoints);
    }, function(error) {
      gendpoints = {};
      // console.log("Failed getting end points : " + response);
      reject(error);
    });
  });
};

function getKeys(keyobject, gendpoints) {
  
  return new Promise(function (resolve, reject) {
    get(gendpoints.jwks_uri)
    .then(function(response) {
      var gkeys = JSON.parse(response.body);
        for (var i=0;i<gkeys.keys.length;i++) {
          if (keyobject[gkeys.keys[i].kid]) {
            console.log("Key id [" + gkeys.keys[i].kid + "] already exists");
          } else {
            keyobject[gkeys.keys[i].kid] = gkeys.keys[i];
            console.log("Key ["+gkeys.keys[i].kid+"] Added");
            console.log("Key Value = " + util.inspect(gkeys.keys[i]));
          }
        }
        resolve(keyobject);
    }, function(error) {
      gkeys = {};
      console.log("Failed getting keys : " + response);
      reject(error);
    });
  })
}

exports.updateKeyList = function updateKeyList (options, endpoints, keyobject) {
  console.log("updateKeyList Called Time = " + new Date());
  getLinks(options, endpoints).then(function(gep) {
     getKeys(keyobject, gep).then(function(gka) {
        kayarray = gka;
     }, function(error) {
        console.log("Error during retrieval : "+ error);
     });
  }, function(error) {
        console.log("Error during getLinks Error : " + error);
  });
  return;
}

exports.verifyToken = function verifyToken(token, goptions, gendpoints, gKeyArray, verifyResult) {
  var parts = token.split('.');
  var headerBuf = new Buffer(parts[0], 'base64');
  var bodyBuf = new Buffer(parts[1], 'base64');
  var header = JSON.parse(headerBuf.toString());
  var body = JSON.parse(bodyBuf.toString());

  // Find a matching google key
  var matchKey = gKeyArray[header.kid];
  if (!matchKey) {
    console.log("Matching key not found : " + header.kid);
    err = { "Error" : 100, "Reason" : "Matching key not found"};
    verifyResult(err, null);
    return;
  }
  //convert to pem file
  var modulus = matchKey.n;
  var exponent = matchKey.e;
  var pem = getPem(modulus, exponent);

  // console.log("PEM file : " + pem);

  var jwtOptions = { "algorithm" : "RS256",
                     "audience" : goptions.GOOGLE_CLIENT_ID,
                     "ignoreExpiration" : false
                   };

  jwt.verify(token, pem, jwtOptions, function(err, decoded) {
    if (err) {
      console.log("Error decoding : " + err);
      verifyResult(err, null);
    } else {
      // Audience expiry check done by jsonwebtoken module verify
      // Expiration checked by jsonwebtoken module verify
      // jsonwebtoken verify only checks for one possible value of iss
      if ((decoded.iss != 'accounts.google.com') && (decoded.iss != 'https://accounts.google.com')) {
        err = 'ISS mismatch - id token authentication failure';
        verifyResult(err, null);
        return;
      }
      verifyResult(null, decoded);
    }
  });
};
