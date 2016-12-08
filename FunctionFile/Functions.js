// Copyright (c) Microsoft. All rights reserved. Licensed under the MIT license. 
// See full license at the bottom of this file.

Office.initialize = function () {
};

function showMessage(message, icon, event) {
  Office.context.mailbox.item.notificationMessages.replaceAsync('msg', {
    type: 'informationalMessage',
    icon: icon,
    message: message,
    persistent: false
  }, function(result){
    event.completed();
  });
}


function setSubject(event){
  Office.context.mailbox.item.subject.setAsync('Hello world!', function(result) {
    if (result.status === Office.AsyncResultStatus.Failed) {
      Office.context.mailbox.item.notificationMessages.addAsync('setSubjectError', {
        type: 'errorMessage',
        message: 'Failed to set subject: ' + result.error
      });
      
      event.completed();
    }
    else {
      showMessage('Subject set', 'icon-16', event);
    }
  });

}

function getSubject(event){
  Office.context.mailbox.item.subject.getAsync(function(result){
    if (result.status === Office.AsyncResultStatus.Failed) {
      Office.context.mailbox.item.notificationMessages.addAsync('getSubjectError', {
        type: 'errorMessage',
        message: 'Failed to get subject: ' + result.error
      });
      
      event.completed();
    }
    else {
      showMessage('The current subject is: ' + result.value, 'icon-16', event);
    }
  });
}

function addToRecipients(event){
  var item = Office.context.mailbox.item;
  var addressToAdd = {
    displayName: Office.context.mailbox.userProfile.displayName,
    emailAddress: Office.context.mailbox.userProfile.emailAddress
  };

  if (item.itemType === Office.MailboxEnums.ItemType.Message) {
    item.to.addAsync([addressToAdd], { asyncContext: event }, addRecipCallback);
  } else if (item.itemType === Office.MailboxEnums.ItemType.Appointment) {
    item.requiredAttendees.addAsync([addressToAdd], { asyncContext: event }, addRecipCallback);
  }
}

function addRecipCallback(result) {
  var event = result.asyncContext;
  if (result.status === Office.AsyncResultStatus.Failed) {
    Office.context.mailbox.item.notificationMessages.addAsync('addRecipError', {
      type: 'errorMessage',
      message: 'Failed to add recipient: ' + result.error
    });
    
    event.completed();
  }
  else {
    showMessage('Recipient added', 'icon-16', event);
  }
}



// This is the function executed by uilessButton1
function buttonFunction1(event) {
  showMessage('uilessButton1 clicked!', 'uilessButtonIcon1-16', event);
}


/*
  MIT License:

  Permission is hereby granted, free of charge, to any person obtaining
  a copy of this software and associated documentation files (the
  "Software"), to deal in the Software without restriction, including
  without limitation the rights to use, copy, modify, merge, publish,
  distribute, sublicense, and/or sell copies of the Software, and to
  permit persons to whom the Software is furnished to do so, subject to
  the following conditions:

  The above copyright notice and this permission notice shall be
  included in all copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
  EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
  MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
  NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
  LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
  OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
  WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/