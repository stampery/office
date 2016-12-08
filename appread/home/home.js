(function(){
  'use strict';

  // The Office initialize function must be run each time a new page is loaded
  Office.initialize = function(reason){
    jQuery(document).ready(function(){

      if (OfficeHelpers.Authenticator.isAuthDialog()) {
        return;
      }

      var authenticator = new OfficeHelpers.Authenticator();

      // register Microsoft (Azure AD 2.0 Converged auth) endpoint using
      authenticator.endpoints.registerMicrosoftAuth('17feb280-1df1-4b0d-8a77-54b3184207cc', {
        redirectUrl: "https://localhost:8443/appread/home/home.html"
      });

      authenticator
          .authenticate(OfficeHelpers.DefaultEndpoints.Microsoft)
          .then(function (token) {
            app.initialize();
            jQuery('#token').text(token.access_token);
          })
          .catch(OfficeHelpers.Utilities.log);
    });
  };
})();
