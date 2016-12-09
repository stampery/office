## Running in localhost

Before running for the first time, generate a certificate and a key with the script borrowed from [here](https://github.com/OfficeDev/Office-Add-in-Nodejs-ServerAuth/blob/7d125dd2862c629ee10baddffe981e84f0ed3b2d/ss_certgen.sh).

On Linux, Mac and Git Bash for Windows

```
$ bash ss_certgen.sh
```
On Cygwin for Windows

```
$ bash -o igncr ss_certgen.sh
```

To install dependencies:

```
$ npm install
```

Before running the server, set the environment variable STAMPERY_TOKEN that you can acquire from https://api-dashboard.stampery.com/.

To start the server:

```
$ npm start
```

Open Web browser https://localhost:8443/ and make the certificate trusted.

To test that the REST API is accessible and working, you can issue a request to the ping endpoint and expect a hash to be returned:

```
$ curl https://localhost:8443/api/ping
6180DAB92AB0107FF5FBF55950AEB2A1F2CFFA287A213834CA7087F2276E017AD1774E4BC99A1FEFCEADF3B5507030730BFA92EAEFAD49FC4C3683AE6E182614
```
