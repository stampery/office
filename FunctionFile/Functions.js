// Copyright (c) Microsoft. All rights reserved. Licensed under the MIT license.
// See full license at the bottom of this file.

// The initialize function is required for all add-ins.
Office.initialize = function () {
};

function hashMail(item, callback) {
  Office.context.mailbox.item.body.getAsync('text', {}, function (result) {
    if (result.status === Office.AsyncResultStatus.Failed) {
      showMessage(result.error);
      return;
    }
    var body = result.value;
    var hash = keccak_512(body);
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
      if (response.error) {
        showMessage(response.error);
        return;
      }
      var result = response.result;
      proof = result.btc || result.eth;
      if (proof) {
        checkSiblings(hash, proof.siblings, proof.root, function (validity) {
          var chain = [null, 'Bitcoin', 'Ethereum'][Math.abs(proof.anchor.chain)];
          showMessage('Valid ' + chain + ' proof: ' + validity, event);
        });
      } else {
        showMessage('Still working on it..', event);
      }
    });
  });
}

function checkSiblings(hash, siblings, root, cb) {
  if (siblings.length > 0) {
    head = siblings.slice(-1);
    tail = siblings.slice(0, -1);
    hash = merkleMixer(hash, head);
    checkSiblings(hash, tail, root, cb);
  } else {
    cb(hash == root);
  }
}

function merkleMixer(a, b) {
  var commuted = a > b && a + b || b + a;
  var hash = keccak_512(commuted).toUpperCase();
  return hash;
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
