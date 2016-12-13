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

  // -2: ETH TEST, -1: BTC TEST, 1: BTC LIVE, 2: ETH CLASSIC
  var chain = Math.abs(proof.anchor.chain);

  switch (chain) {
    case 2: // ETH
      // Store the Ethereum proof and remember the root for stitching the bitcoin proof when it arrives
      proofsDict[hash] = {eth: proof, btc: null};
      if (!(proofsDict['r'+proof.root] instanceof Array))
        proofsDict['r'+proof.root] = []
      proofsDict['r'+proof.root].push(hash);
      console.log(proofsDict['r'+proof.root]);
      break;
    case 1: // BTC
      // Recover the Ethereum proof, stitch both proofs and forget about the root
      var prev_hashes  = proofsDict['r'+hash];
      if (!prev_hashes)
        break;

      prev_hashes.forEach(function (h) {
        console.log('Extending proof for hash', h);
        if (proofsDict[h] && 'btc' in proofsDict[h]) {
          var eth = proofsDict[h].eth;
          // Sad way to copy objects until Object.assign() is supported by IE
          var btc_proof = JSON.parse(JSON.stringify(proof));
          btc_proof.hash = eth.hash;
          btc_proof.siblings = btc_proof.siblings.concat(eth.siblings);
          proofsDict[h].btc = btc_proof;
        }
      });
      delete proofsDict['r'+hash];
      break;
    default:
      console.log('Received proof for unknown chain');
  }
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
