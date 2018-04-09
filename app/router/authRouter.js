const requiresLoggedIn = require('../helpers/authHelper').requiresLoggedIn;
const requiresAdmin    = require('../helpers/authHelper').requiresAdmin;
const getSessionData   = require('../helpers/authHelper').getSessionData;
const createApiKey     = require('../helpers/authHelper').createApiKey;
const AuthController   = require('../controllers/authController.js').AuthController;

function initAuthRouter(app) {

  /* BASIC AUTH ROUTES */
  /*****************************************************************
   * Used to sign in, sign up, log out, and verify auth of users.  *
   *****************************************************************/ 
  app.get('/authstatus', (req, res) => {
    return res.send(getSessionData(req));
  });
  app.post('/signup', (req, res) => {
    AuthController.signUp(req.body).then((response) => {
      res.send(response);
    }).catch((err) => {
      console.error(err);
      res.sendStatus(500);
    });
  });
  app.post('/login', (req, res) => {
    AuthController.logIn(req.body).then((response) => {
      res.send(response);
    }).catch((err) => {
      console.error(err);
      res.send(err);
    });
  });
  app.get('/logout', (req, res) => {
    // noop for now... Not sure if we need to do anything else.
    res.sendStatus(200);
  });

  /* ADMIN ROUTES */
  /*****************************************************************
   * Used for verifying created users and handling the admin panel *
   *****************************************************************/  
  app.post('/verify-user', requiresAdmin, (req, res) => {
    AuthController.verifyUser(req.body).then((response) => {
      res.send(response);
    }).catch((err) => {
      res.send(console.error(err));
      res.sendStatus(500);
    });
  });
  app.get('/users', requiresAdmin, (req, res) => {
    AuthController.getUsers().then((response) => {
      res.send(response);
    }).catch((err) => {
      res.send(console.error(err));
      res.sendStatus(500);
    });
  });
  app.get('/unverified-users', requiresAdmin, (req, res) => {
    AuthController.getUsers({verified: false}).then((response) => {
      res.send(response);
    }).catch((err) => {
      res.send(console.error(err));
      res.sendStatus(500);
    });
  });
  app.get('/user', requiresAdmin, (req, res) => {
    AuthController.getUserById(req.query._id).then((response) => {
      res.send(response);
    }).catch((err) => {
      res.send(console.error(err));
      res.sendStatus(500);
    });
  });
  app.get('/createApiKey', requiresAdmin, (req, res) => {
    res.send(createApiKey());
  });
}

exports.initAuthRouter = initAuthRouter;
