# Outlook Add-in for Blockchain

This Outlook add in for blockchain creates and outlook add in to certify and validate emails on the blockchain using https://stampery.com/

## Prerequsites

In order to run this sample, you will need the following:

- A web server to host the sample files. The server must be able to accept SSL-protected requests (https) and have a valid SSL certificate.
- An Office 365 email account **or** an Outlook.com email account.
- Outlook 2016, which is part of the [Office 2016 Preview](https://products.office.com/en-us/office-2016-preview).

## Configuring and installing the sample

1. Download or fork the repository.
1. Copy the add-in files to a web server. You have a couple of options:
  1. Manually upload to a server:
    1. Upload the `AppCompose`, `AppRead`, `FunctionFile`, `Images`, and `Scripts` directories to a directory on your web server.
    1. Open `command-demo-manifest.xml` in a text editor. Replace all instances of `https://localhost:8443` with the HTTPS URL of the directory where you uploaded the files in the previous step. Save your changes.
  1. Use `gulp-webserver` (requires NPM):
    1. Open your command prompt in the directory where the `package.json` file is installed and run `npm install`.
    1. Run `gulp serve-static` to start a web server in the current directory.
    1. In order for Outlook to load the add-in, the SSL certificate used by `gulp-webserver` must be trusted. Open your browser and go to `https://localhost:8443/AppRead/TaskPane/TaskPane.html`. If you are prompted that "there is a problem with this website's security certificate" (IE or Edge), or that "the site's security certificate is not trusted" (Chrome), you need to add the certificate to your trusted root certification authorities. If you continue to the page in the browser, most browsers allow you to view and install the certificate. Once you install and restart your browser, you should be able to browse to `https://localhost:8443/AppRead/TaskPane/TaskPane.html` with no errors.
1. Logon to your email account with a browser at either https://outlook.office365.com (for Office 365), or https://www.outlook.com (for Outlook.com). Click on the gear icon in the upper-right corner, then click **Options**.
    
  ![The Options menu item on https://www.outlook.com](https://raw.githubusercontent.com/jasonjoh/command-demo/master/readme-images/outlook-manage-addins.PNG)

1. In the left-hand navigation, expand **General**, then click **Manage add-ins**.
    
1. In the add-in list, click the **+** icon and choose **Add from a file**.

  ![The Add from file menu item in the add-in list](https://raw.githubusercontent.com/jasonjoh/command-demo/master/readme-images/addin-list.PNG)

1. Click **Browse** and browse to the `command-demo-manifest.xml` file on your development machine. Click **Next**.

  ![The Add add-in from a file dialog](https://raw.githubusercontent.com/jasonjoh/command-demo/master/readme-images/browse-manifest.PNG)

1. On the confirmation screen, you will see a warning that the add-in is not from the Office Store and hasn't been verified by Microsoft. Click **Install**.
1. You should see a success message: **You've added an add-in for Outlook**. Click OK.

## Running the sample ##

1. Open Outlook 2016 and connect to the email account where you installed the add-in.
1. Open an existing message (either in the reading pane or in a separate window). Notice that the add-in has placed new buttons on the command ribbon.
  
  

## Key components of the sample

- [```command-demo-manifest.xml```](command-demo-manifest.xml): The manifest file for the add-in.
- [```FunctionFile/Functions.html```](FunctionFile/Functions.html): An empty HTML file to load `Functions.js` for clients that support add-in commands.
- [```FunctionFile/Functions.js```](FunctionFile/Functions.js): The code that is invoked when the add-in command buttons are clicked.
- [```AppRead/TaskPane/TaskPane.html```](AppRead/TaskPane/TaskPane.html): The HTML markup for the task pane UI displayed by the **Display all properties** button. This is also displayed by clients in read mode that do not support add-in commands.
- [```AppRead/TaskPane/TaskPane.js```](AppRead/TaskPane/TaskPane.js): Code used by the task pane UI displayed by the **Display all properties** button.
- 

## How's it all work?

The key part of the sample is the structure of the manifest file. The manifest uses the same version 1.1 schema as any Office add-in's manifest. However, there is a new section of the manifest called `VersionOverrides`. This section holds all of the information that clients that support add-in commands (**currently only Outlook 2016**) need to invoke the add-in from a ribbon button. By putting this in a completely separate section, the manifest can also include the original markup to enable the add-in to be loaded by clients that do not support the add-in command model. You can see this in action by loading the add-in in Outlook 2013 or Outlook on the web.

### The Add-in Command Demo add-in loaded in Outlook on the web ###

#### Read mail form ####

![The add-in loaded in Outlook on the web's read mail form](https://raw.githubusercontent.com/jasonjoh/command-demo/master/readme-images/outlook-on-web-read.PNG)

#### Compose mail form ####

![The add-in loaded in Outlook on the web's compose mail form](https://raw.githubusercontent.com/jasonjoh/command-demo/master/readme-images/outlook-on-web.PNG)

Within the `VersionOverrides` element, there are three child elements, `Requirements`, `Resources`, and `Hosts`. The `Requirements` element specifies the minimum API version required by the add-in when loaded by clients that support the add-in model. The `Resources` element contains information about icons, strings, and what HTML file to load for the add-in. The `Hosts` section specifies how and when the add-in is loaded.

In this sample, there is only one host specified (Outlook):

```xml
<Host xsi:type="MailHost">
```
    
Within this element are the configuration specifics for the desktop version of Outlook:

```xml
<DesktopFormFactor>
```
    
The URL to the HTML file with all of the JavaScript code for the button is specified in the `FunctionFile` element (note that it uses the resource ID specified in the `Resources` element):

```xml
<FunctionFile resid="functionFile" />
```


### A button that executes the verification ###

This is created by setting the `xsi:type` attribute of a `Control` element to `Button`, and adding an `Action` child element with an `xsi:type` attribute set to `ExecuteFunction`. For example, look at the **Insert default message** button:

```xml
<!-- Function (UI-less) button -->
<Control xsi:type="Button" id="msgComposeFunctionButton">
  <Label resid="funcComposeButtonLabel" />
  <Supertip>
    <Title resid="funcComposeSuperTipTitle" />
    <Description resid="funcComposeSuperTipDescription" />
  </Supertip>
  <Icon>
    <bt:Image size="16" resid="blue-icon-16" />
    <bt:Image size="32" resid="blue-icon-32" />
    <bt:Image size="80" resid="blue-icon-80" />
  </Icon>
  <Action xsi:type="ExecuteFunction">
    <FunctionName>addDefaultMsgToBody</FunctionName>
  </Action>
</Control>
```
    

    
### A button that creates and displays the Certificate ###

This is created by setting the `xsi:type` attribute of a `Control` element to `Button`, and adding an `Action` child element with an `xsi:type` attribute set to `ShowTaskPane`. For example, look at the **Insert custom message** button:

```xml
<!-- Task pane button -->
<Control xsi:type="Button" id="msgComposeOpenPaneButton">
  <Label resid="paneComposeButtonLabel" />
  <Supertip>
    <Title resid="paneComposeSuperTipTitle" />
    <Description resid="paneComposeSuperTipDescription" />
  </Supertip>
  <Icon>
    <bt:Image size="16" resid="green-icon-16" />
    <bt:Image size="32" resid="green-icon-32" />
    <bt:Image size="80" resid="green-icon-80" />
  </Icon>
  <Action xsi:type="ShowTaskpane">
    <SourceLocation resid="composeTaskPaneUrl" />
  </Action>
</Control>
```

## Questions and comments

- If you have any trouble running this sample, please [log an issue](https://github.com/hdsw/officeblock/issues).
- Questions about Office Add-in development in general should be posted to [Stack Overflow](http://stackoverflow.com/questions/tagged/office-addins). Make sure that your questions or comments are tagged with `office-addins`.

## Additional resources

- [Outlook Dev Center](https://dev.outlook.com)
- [Office Add-ins](https://msdn.microsoft.com/library/office/jj220060.aspx) documentation on MSDN
- [More Add-in samples](https://github.com/OfficeDev?utf8=%E2%9C%93&query=-Add-in)

## Copyright

Copyright (c) 2015 Microsoft. All rights reserved.


----------

Follow the [Outlook Dev Blog](http://blogs.msdn.com/b/exchangedev/)
