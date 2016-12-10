'use strict';

var express = require('express');
var router = express.Router();
var Stampery = require('stampery');

var development = process.env.NODE_ENV !== 'production';
var stamperyToken = process.env.STAMPERY_TOKEN;

if (!stamperyToken) {
  console.error('Environment variable STAMPERY_TOKEN must be set before running!');
  process.exit(-1);
}

//var stampery = new Stampery(process.env.STAMPERY_TOKEN, development ? 'beta' : false);
// For now, always use production Stampery API due to not making it work against beta.
var stampery = new Stampery(process.env.STAMPERY_TOKEN);

stampery.on('proof', function (hash, proof) {
  console.log('Received proof for ' + hash, proof);
  stampery.prove(hash, proof, function (valid) {
    console.log('Proof validity:', valid);
  });
});

stampery.on('ready', function () {
  stampery.hash('The piano has been drinking', function (hash) {
    console.log(hash);
    //stampery.stamp(hash);
  });
});

router.get('/ping', function (req, res) {
  stampery.hash('ping', function (hash) {
    res.send(hash);
  });
});

module.exports = router;
