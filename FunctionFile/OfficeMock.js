(function () {
  var dummyMailBody = 'Dummy mail body with random number: ' + Math.random();
  window.onload = function () {
    window.Office = {};
    Office.AsyncResultStatus = {
      Succeeded: 0,
      Failed: 1
    };
    Office.MailboxEnums = {
      ItemNotificationMessageType: {
        InformationalMessage: 'informationalMessage'
      }
    };
    Office.context = {
      mailbox: {
        item: {
          body: {
            getAsync: function (dummy, options, callback) {
              callback({
                status: Office.AsyncResultStatus.Succeeded,
                value: dummyMailBody
              });
            }
          },
          notificationMessages: {
            replaceAsync: function (dummy, data, callback) {
              document.getElementById('notification').innerHTML = data.message;
              callback({
                status: Office.AsyncResultStatus.Succeeded
              });
            }
          }
        }
      }
    };

    window.dummyEvent = {
      completed: function () {}
    };
    var testMarkup = '<button onclick="stamp(dummyEvent)">Stamp</button>';
    testMarkup += '<button onclick="prove(dummyEvent)">Prove</button>';
    testMarkup += '<div id="notification"></div>';
    document.body.innerHTML = testMarkup;
  };
}());
