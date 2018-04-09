'use strict';
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').load();
}

const fs         = require('fs');
const express    = require('express');
const bodyParser = require('body-parser');

const initRouter = require('./router/router.js').initRouter;

//   Constants  //
const PORT = process.env.PORT || 3000;

//   App
const app = express();
app.use(express.static('assets'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json({limit: '50mb'}));
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, DELETE, PUT, PATCH');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

// Create the folders for our filesystem
if (!fs.existsSync(process.cwd() + '/assets')) {
  fs.mkdirSync(process.cwd() + '/assets');
  if (!fs.existsSync(process.cwd() + '/assets/user_images')) {
    fs.mkdirSync(process.cwd() + '/assets/user_images');
  }
}

//   Routes  //
initRouter(app);

// Start the app
app.listen(PORT, function(){
  console.log(`Running on port: ${PORT}`);
});