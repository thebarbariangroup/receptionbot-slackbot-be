# receptionbot-slackbot-be

This is the backend component of the Reception Slackbot. It is in charge of keeping and transforming a database of users to be retrieved via API.
The [front-end repo](https://github.com/thebarbariangroup/receptionbot-slackbot-fe) provides the interface for interacting with the API.

## Prerequisites
 - [Node](https://nodejs.org/en/) v6.12.3 (NPM v3.10.10)
 - [Express](https://expressjs.com/) v4.16.2
 - [MongoDB](https://www.mongodb.com/) v3.4.10
 - [Mongoose](http://mongoosejs.com/) v4.12.3

## Building the app
### Install MongoDB
https://docs.mongodb.com/manual/installation/

Make sure it is running as a service or started manually on your machine or you will get a connection error when trying to start the server

### Install modules

```npm install```

### Running server

#### Dev build:
- Check ```.env``` and configure the variables:
  - Change ```MONGODB_URI``` to the location of your install and the name of the DB
    - This should look something like ```mongodb://localhost/[db-name]```
  - Add ```SLACK_API_TOKEN``` with your OAuth access token
    - You can add multiple Slack instances by delimiting the ```SLACK_API_TOKEN```s with a ```|``` (pipe)
  - Add a random string to seed the JSON Web Token generator
  - Add a specific ```PORT``` to run the API out of.
    - By default the server start on port 3000

- start the server via ```npm run dev```

If everything goes well, you should see: 
```Running on port: 3000``` (or whatever ```PORT``` you specified in the ```.env```)
```MONGODB CONNECTION ACCEPTED```

You can now debug this server using Google Chrome by navigating to ```chrome://inspect``` and inspecting ```app/server.js```.

The port will be important when connecting the front-end repo(https://github.com/thebarbariangroup/receptionbot-slackbot-fe) as this will be the API_URI of the app.

#### Prod build:
- Configure ```ENV_VAR```s on your server of choice.
  - Include ```NODE_ENV``` as "production"
  - Change ```MONGODB_URI``` to the location of your install and the name of the DB
    - This should look something like ```mongodb://localhost/[db-name]```
  - Add ```SLACK_API_TOKEN``` with your OAuth access token
    - You can add multiple Slack instances by delimiting the ```SLACK_API_TOKEN```s with a ```|``` (pipe)
  - Add a random string to seed the JSON Web Token generator
  - Add a specific ```PORT``` to run the API out of.
    - By default the server start on port 3000

- start the server via ```npm start```

If everything goes well, you should see: 
```Running on port: 3000``` (or whatever ```PORT``` you specified in the ```ENV_VAR```s)
```MONGODB CONNECTION ACCEPTED```

The port will be important when connecting the [front-end repo](https://github.com/thebarbariangroup/receptionbot-slackbot-fe) as this will be the API_URI of the app.
