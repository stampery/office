// Copyright (c) Microsoft. All rights reserved. Licensed under the MIT license.
// See full license at the bottom of this file.

// The initialize function is required for all add-ins.
Office.initialize = function () {
};

// Buffer-handling library shorthand
Buffer = buffer.Buffer;

function hashMail(item, callback) {
  Office.context.mailbox.item.body.getAsync('text', {}, function (result) {
    if (result.status === Office.AsyncResultStatus.Failed) {
      showMessage(result.error);
      return;
    }
    var body = result.value;
    var hash = sha256(body);
    callback(hash.toUpperCase());
  });
}

function handleRequest(xhr, body, callback) {
  xhr.onreadystatechange = function () {
    if (xhr.readyState === 4) {
      if  (xhr.status === 200) {
        callback(JSON.parse(xhr.responseText));
      } else {
        callback({
          error: 'Request status: ' + xhr.status
        });
      }
    }
  };
  xhr.onerror = function () {
    callback({
      error: 'Request error'
    });
  };
  xhr.send(body && JSON.stringify(body) || null);
}

function postHash(hash, callback) {
  var xhr = new XMLHttpRequest();
  xhr.open('POST', '/api/stamp');
  xhr.setRequestHeader('Content-Type', 'application/json');
  handleRequest(xhr, hash, callback);
}

function getProof(hash, callback) {
  var xhr = new XMLHttpRequest();
  xhr.open('GET', '/api/proofs/' + hash);
  handleRequest(xhr, null, callback);
}

function stamp(event) {
  hashMail(Office.context.mailbox.item, function (hash) {
    postHash({ hash: hash }, function (response) {
      if (response.error) {
        showMessage(response.error, event);
      } else {
        showMessage('Successfully stamped', event);
      }
    });
  });
}

function prove(event) {
  hashMail(Office.context.mailbox.item, function (hash) {
    getProof(hash, function (response) {
      if (response.error || !response.result) {
        return showMessage(response.error, event);
      }
      var receipts = response.result.receipts;
      var receipt = [receipts.btc, receipts.eth].find(function (receipt) {
        return typeof receipt != 'number';
      });
      if (receipt) {
        var hash = new Buffer(receipt.targetHash, 'hex');
        var validity = checkSiblings(hash, receipt.proof, receipt.merkleRoot);
        var anchor = receipt.anchors[0];
        var chain = {'ETHData': 'Ethereum', 'BTCOpReturn': 'Bitcoin'}[anchor.type];
        var date = new Date(response.result.time);
        showMessage('The ' + chain + ' blockchain attested the content of this email as of ' + date, event);
      } else {
        showMessage('Still working on it.. (' + receipts.eth + ' seconds left)', event);
      }
    });
  });
}

function checkSiblings(hash, siblings, root) {
  if (siblings.length > 0) {
    var head = siblings[0];
    var tail = siblings.slice(1);
    var hashes = [hash, head.right];
    if ('left' in head)
      hashes = [head.left, hash];
    var hash = merkleMixer(hashes);
    return checkSiblings(hash, tail, root);
  } else {
    var root = new Buffer(root, 'hex');
    return root.equals(hash);
  }
}

function merkleMixer(hashes) {
  var buf = Buffer.concat(hashes.map(function (h) {
    return Buffer(h, 'hex');
  }));
  return new Buffer(sha256(buf), 'hex');
}

function showMessage(message, event) {
  Office.context.mailbox.item.notificationMessages.replaceAsync('stampery-notifications-id', {
    type: Office.MailboxEnums.ItemNotificationMessageType.InformationalMessage,
    icon: 'icon-16',
    message: message,
    persistent: false
  }, function (result) {
    if (result.status === Office.AsyncResultStatus.Failed) {
      showMessage('Error when showing a notification', event);
    }
    if (event) {
      event.completed();
    }
  });
}

/*
  MIT License:

  Permission is hereby granted, free of charge, to any person obtaining
  a copy of this software and associated documentation files (the
  'Software'), to deal in the Software without restriction, including
  without limitation the rights to use, copy, modify, merge, publish,
  distribute, sublicense, and/or sell copies of the Software, and to
  permit persons to whom the Software is furnished to do so, subject to
  the following conditions:

  The above copyright notice and this permission notice shall be
  included in all copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
  EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
  MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
  NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
  LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
  OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
  WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/
