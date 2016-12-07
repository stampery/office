// Copyright (c) Microsoft. All rights reserved. Licensed under the MIT license. See full license at the bottom of this file.

/// <reference path="../App.js" />

(function () {
  "use strict";

  // The Office initialize function must be run each time a new page is loaded
  Office.initialize = function (reason) {
      $(document).ready(function () {
          app.initialize();

          loadProps();
      });
  };
  
  
  
  // Load properties from the Item base object, then load the
  // type-specific properties.
  function loadProps() {
    var item = Office.context.mailbox.item;
    
    $('#dateTimeCreated').text(item.dateTimeCreated.toLocaleString());
    $('#dateTimeModified').text(item.dateTimeModified.toLocaleString());
    $('#itemClass').text(item.itemClass);
    $('#itemId').text(item.itemId);
    $('#itemType').text(item.itemType);
    
    item.body.getAsync('html', function(result){
      if (result.status === 'succeeded') {
        $('#bodyHtml').text(result.value);
      }
    });
    
    item.body.getAsync('text', function(result){
      if (result.status === 'succeeded') {
        $('#bodyText').text(result.value);
      }
    });
    
    if (item.itemType == Office.MailboxEnums.ItemType.Message){
      loadMessageProps(item);
    }
    else {
      loadAppointmentProps(item);
    }
  }
})();

// MIT License: 
 
// Permission is hereby granted, free of charge, to any person obtaining 
// a copy of this software and associated documentation files (the 
// ""Software""), to deal in the Software without restriction, including 
// without limitation the rights to use, copy, modify, merge, publish, 
// distribute, sublicense, and/or sell copies of the Software, and to 
// permit persons to whom the Software is furnished to do so, subject to 
// the following conditions: 
 
// The above copyright notice and this permission notice shall be 
// included in all copies or substantial portions of the Software. 
 
// THE SOFTWARE IS PROVIDED ""AS IS"", WITHOUT WARRANTY OF ANY KIND, 
// EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF 
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND 
// NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE 
// LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION 
// OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION 
// WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.