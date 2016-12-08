'use strict';

var express = require('express');
var router = express.Router();
var Stampery = require('stampery');

var development = process.env.NODE_ENV !== 'production';

var stampery = new Stampery(process.env.STAMPERY_TOKEN, development ? 'beta' : 'prod');

stampery.on('proof', function (hash, proof) {
  console.log('Received proof for ' + hash, proof);
  stampery.prove(hash, proof, function (valid) {
    console.log('Proof validity:', valid);
  });
});

stampery.on('ready', function () {
  stampery.receiveMissedProofs();
  stampery.hash('The piano has been drinking', function (hash) {
    console.log(hash);
    //stampery.stamp(hash);
  });
});

router.get('/ping', function (req, res) {
  res.send('pong');
});

module.exports = router;
