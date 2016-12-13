// Copyright (c) Microsoft. All rights reserved. Licensed under the MIT license.
// See full license at the bottom of this file.

var _mailbox = null;
var _customProperties = null;
var _initialized = false;
var _queuedOperation = null;

// The initialize function is required for all add-ins.
Office.initialize = function () {
  _mailbox = Office.context.mailbox;
  _mailbox.item.loadCustomPropertiesAsync(function (result) {
    if (result.status === Office.AsyncResultStatus.Failed) {
      // Handle the failure.
    }
    else {
      // Successfully loaded custom properties,
      // can get them from the result argument.
      _customProperties = result.value;
      _initialized = true;
      if (_queuedOperation) {
        _queuedOperation[0](_queuedOperation[1]);
      }
    }
  });
};

// If loaded outside of Office, mock the Office object for easier testing
if (window.self === window.top) {
  window.onload = function () {
    window.Office = {};
    Office.AsyncResultStatus = {
      Succeeded: 0,
      Failed: 1
    };
    Office.context = {
      mailbox: {
        item: {
          body: {
            getAsync: function (dummy, options, callback) {
              callback({
                status: Office.AsyncResultStatus.Succeeded,
                value: 'Dummy mail body'
              });
            }
          },
          notificationMessages: {
            replaceAsync: function (dummy, data, callback) {
              document.getElementById('notification').innerHTML = data.message;
              callback();
            }
          }
        }
      }
    };
    var _savedProperties = {};
    _customProperties = {
      set: function (name, value) {
        _savedProperties[name] = value;
      },
      get: function (name) {
        return _savedProperties[name];
      },
      saveAsync: function (callback) {
        callback({
          status: Office.AsyncResultStatus.Succeeded
        });
      }
    };

    window.dummyEvent = {
      completed: function () {}
    };
    var testMarkup = '<button onclick="stamp(dummyEvent)">Stamp</button>';
    testMarkup += '<button onclick="prove(dummyEvent)">Prove</button>';
    testMarkup += '<div id="notification"></div>';
    document.body.innerHTML = testMarkup;

    _initialized = true;
  };
}

function postHash(body, callback) {
  var xhr = new XMLHttpRequest();
  xhr.open('POST', '/api/stamp');
  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.onreadystatechange = function () {
    if (xhr.readyState == 4 && xhr.status == 200) {
      callback(JSON.parse(xhr.responseText));
    }
  };
  xhr.send(JSON.stringify(body));
}

function getProof(hash, callback) {
  var xhr = new XMLHttpRequest();
  xhr.open('GET', '/api/proofs/' + hash);
  xhr.onreadystatechange = function () {
    if (xhr.readyState == 4 && xhr.status == 200) {
      callback(JSON.parse(xhr.responseText));
    }
  };
  xhr.send();
}

function stamp(event) {
  if (!_initialized) {
    _queuedOperation = [_stamp, event];
  } else {
    _stamp(event);
  }
}

function _stamp(event) {
  Office.context.mailbox.item.body.getAsync('text', {}, function (result) {
    if (result.status === Office.AsyncResultStatus.Failed) {
      // TODO: Handle error.
      return;
    }
    var body = result.value;
    console.log('Mail body: ' + body);
    var hash = keccak_512(body);
    postHash({ hash: hash }, function (response) {
      _customProperties.set('stampery-hash', response.result);
      _customProperties.saveAsync(function (result) {
        if (result.status === Office.AsyncResultStatus.Failed) {
          // TODO: Handle the failure.
        } else {
          showMessage('Successfully stamped', 'icon-16', event);
        }
      });
    });
  });
}

function prove(event) {
  if (!_initialized) {
    _queuedOperation = [_prove, event];
  } else {
    _prove(event);
  }
}

function _prove(event) {
  var hash = _customProperties.get('stampery-hash');
  if (!hash) {
    showMessage('No UUID found from properties!', 'icon-16', event);
    return;
  }
  getProof(hash, function (response) {
    if (response.error) {
      // TODO: Handle error.
      return;
    }
    var result = response.result;
    proof = result.btc || result.eth;
    if (proof) {
      // showMessage('Transaction found', 'icon-16', event);
      checkSiblings(hash, proof.siblings, proof.root, function (validity) {
          var chain = [null, 'Bitcoin', 'Ethereum'][Math.abs(proof.anchor.chain)];
          showMessage('Valid ' + chain + ' proof: ' + validity, 'icon-16', event);
      });
    } else {
      showMessage('Still working on it..', 'icon-16', event);
    }
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

function showMessage(message, icon, event) {
  Office.context.mailbox.item.notificationMessages.replaceAsync('msg', {
    type: 'informationalMessage',
    icon: icon,
    message: message,
    persistent: false
  }, function (result) {
    event.completed();
  });
}

function setSubject(event) {
  prove(event);
}

function getSubject(event) {
  stamp(event);
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
