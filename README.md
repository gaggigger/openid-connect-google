#openid-connect-google
##Problem
Application consists of an Angular JS based frontend and a Node JS based backend. The backend service exposes a REST API. The backend service runs in the cloud on a public IP address.
How to protect the backend API service without the burden of protecting user passwords?

##Solution
Use the openid connect protocol to protect the API server. The only piece of user information the API server stores is the email address of valid users of the API.

Create three NodeJS servers:

1. A server to implement open-id connect protocol - Login Service.
2. A server to deliver the Angular JS application to the browser - Webapp.
3. API server - API service

Users connect to the Login server first. Users are redirected to the login server if the user tries to access the API server before the user is authenticated. 
Once authentication is complete the user is redirected to the Webapp. 
The redirect request passes the id_token (JSON Web Token - JWT) as a query parameter. This launches the Angular JS application in the browser. 
The Angular JS application uses the JWT to makes API calls to the API service. 
The JWT contains the users email address, the API service verifies that the email address is in its database of allowed users before permitting access to the API. 

We use Google as the OpenId-Connect provider. As we use the Passport JS Module to implement Openid-Connect, the Opendid-Connect (Facebook, Twitter etc.) provider can be changed with a small additional effort.

#Configuration procedure
This document assumes that you have a Google Compute Engine account, have created a project and have a virtual machine to use. The VM must have a public IP you can reach.

1. SSH into your virtual machine
2. Install NodeJS (https://nodejs.org/en/download/). Use Linux 64 bit binary
3. Download and install nginx (http://nginx.org/en/linux_packages.html#stable)
4. Clone this repository

##Google Compute Engine Setup

Log into your GCE dashboard and select your project.

1. Click on “Enable APIs and credentials like keys”
2. Click on the Credentials
3. Click “New Credentials” -> “OAuth Client ID” 
4. Select “Web Application”
5. Give it a name eg. “OpenIDTest”
6. Authorized Java Script Origins – Set it to http://localhost:3001
7. Authorized URI’s – set to http://localhost:3001/callback
8. Click on create
9. You will be given a Client ID and Client Secret. Save these away. You will be using this when authenticating to access your API server
You are now done with setting up the keys required to access the API server you are building as a part of this tutorial.


##The application can be run in two modes, local and cloud. 

###Local Mode:  
In the local mode, the application can be run on your linux desktop/laptop or on a MacBook. There is no need to use the VM in the cloud. You still need an account on Google Compute Engine to configure API credentials and obtain client id and secret. Nginx installation and configuration is not necessary. The local setup looks like the following.

![alt text](https://github.com/umareddy/openid-connect-google/blob/master/docs/local.png "Cloud Mode")

Once the repository has been cloned, do the following for setting up local configuration:
``` 
cp conf/google_client_config.json.local conf/google_client_config.json
cp conf/google_client_secret.json.local conf/google_client_secret.json 
```

Edit ```conf/google_client_config.json```
Set the clients id to the id from GCE Console
Edit the ```conf/google_client_secret.json```
Set the client secret to the value from GCE console

Edit the ```fixtures/users.json``` file and set at least one of the email addresses to the gmail address you will be using to login.

Edit the file ```app/angularapp.js``` file
Make sure PASSPORT_LOCAL_TEST is set to true

###Cloud Mode
In the cloud mode the services are run behind a nginx webserver. Browser uses HTTPS to the nginx webserver. The cloud setup looks like the following.

![alt text](https://github.com/umareddy/openid-connect-google/blob/master/docs/cloud.png "Cloud Mode")

Once the repository has been cloned, do the following for setting up local configuration:
```
cp conf/google_client_config.json.cloud conf/google_client_config.json
cp conf/google_client_secret.json.cloud conf/google_client_secret.json
```

Edit ```google_client_config.json```
Set the clients id to the id from GCE Console
Set the CALLBACK_URL to : 
```
http://www.my-openid-connect-cloud.com/callback
```
May sure that domain name is set correctly. If you do not have a DNS routable domain add an entry to ```/etc/hosts``` to add the public IP address pointing to your made-up domain name on the MacBook on which you will be running your browser. If using Windows or Linux do the equivalent to force your computer to translate your domain name to an IP address.

Edit the ```google_client_secret.json```
Set the client secret to the value from GCE console

Edit the ```fixtures/users.json``` file and set at least one of the email addresses to the gmail address you will be using to login.

Edit the file ```app/angularapp.js``` file
Make sure PASSPORT_LOCAL_TEST is set to ```false```

Copy the file ```nginx/nginx.conf``` to ```/etc/nginx/nginx.conf``` on your cloud server. Edit ```nginx.conf``` and replace  ```www.myowncomapny.com``` with the IP address of your cloud VM.
Run the command 
```
sudo nginx –s reload
```
Check ```/var/log/nginx/error.log``` to ensure that there were no errors.



##Launching the application:
From the root directory of the application run the command:
```
scripts/start
```
To stop
```
scripts/stop
```

Point your browser to 
```localhost:5001``` in localhost setup
```www.mycomapy.com``` in cloud setup.


To be secure, you could configure network firewall rules for your GCE instance to only accept incoming traffic from your public IP address. You can find this by tying my ipaddress at the google prompt. When you have finished testing the authentication module you could remove this restriction to allow any ip address to reach your service. The user will not be allowed to access your api service if the user is not authenticated

#TO DO
1. Make the keys retrieved from Google persistent
2. Retrieve keys periodically from Google. Google seems to be changing keys every hour. On a key-not-found error retrieve keys and try to verify the JWT with the new keys before returning an authentication error.
3. Keep old keys around for a day or so
