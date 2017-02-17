'use strict';

const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser')
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

router.use(bodyParser.json());

router.post('/stamp', function (req, res) {
  var hash = req.body.hash;

  // Throw error 400 if no hash
  if (!hash)
    return res.status(400).send({error: 'No Hash Specified'});

  // Transform hash to upper case (Stampery backend preferes them this way)
  hash = hash.toUpperCase()

  // Throw error 422 if hash is malformed
  var re = /^[A-F0-9]{64}$/;
  if (!(re.test(hash)))
    return res.status(422).send({error: 'Malformed Hash'});

  stampery.stamp(hash, function(err, receipt) {
    if (err)
      res.status(503).send({error: err});
    else
      res.send({result: receipt.id, error: null});
  });
    
});

router.get('/proofs/:hash', function (req, res) {
  var hash = req.params.hash;
  
  stampery.getByHash(hash, function(err, receipts) {
    if (err)
      res.status(503).send({error: err});
    else
      if (receipts.length > 0)
        res.send({result: receipts[0], error: null});
      else
        res.status(200).send({error: 'Oops! This email has not yet been attested by any blockchain.'});
  });
  
});

module.exports = router;
