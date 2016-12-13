'use strict';

const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser')
const uuidV4 = require('uuid/v4');
const Stampery = require('stampery');

const development = process.env.NODE_ENV !== 'production';
const stamperyToken = process.env.STAMPERY_TOKEN;

var proofsDict = {}

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
  var prev_proof = proofsDict[hash];
  if (!prev_proof)
    prev_proof = {eth: null, btc: null};

  prev_proof[[null, 'btc', 'eth'][Math.abs(proof.anchor.chain)]] = proof;
});

stampery.on('ready', function () {
  stampery.hash('The piano has been drinking', function (hash) {
    console.log(hash);
  });
});

router.use(bodyParser.json());

router.post('/stamp', function (req, res) {
  var hash = req.body.hash;

  // Throw error 400 if no hash
  if (!hash)
    return res.status(400).send({error: 'No Hash Specified'});

  // Transform hash to upper case (Stampery backend preferes them this way)
  hash = hash.toUpperCase()

  // Throw error 422 if hash is malformed
  var re = /^[A-F0-9]{128}$/;
  if (!(re.test(hash)))
    return res.status(422).send({error: 'Malformed Hash'});

  // Perform actual stamping and return success or error
  if (stampery.stamp(hash)) {
    // Create an entry for hash in proofsDict
    proofsDict[hash] = {eth: null, btc: null};
    res.send({result: hash, error: null});
  }  else {
    res.status(503).send({error: 'Stamping Failed'});
  }
});

router.get('/proofs/:hash', function (req, res) {
  var hash = req.params.hash;

  // Check if stamp exists
  if (!(hash in proofsDict))
    return res.status(404).send({error: 'Stamp Not Found'});

  var proofs = proofsDict[hash];

  res.send({result: proofs, error: null});
});

router.get('/ping', function (req, res) {
  stampery.hash('ping', function (hash) {
    res.send({result: hash});
  });
});

module.exports = router;
