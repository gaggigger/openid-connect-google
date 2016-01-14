#openid-connect-google

End to end example in node js illustrating the implementation of the OpenId Connect protocol to secure an API server. Includes code to authorize and authenticate the user using Google login. Once the user has been authenticated the sample application shows how the id_token returned can be used to communicate with the API server. The example shows how the id_token is validated by the API server using Google API. The sample code uses Node JS Angular JS and the Module Passport JS to implement a secure authentication mechanism for an API server.


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
