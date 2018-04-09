const requiresLoggedIn = require('../helpers/authHelper').requiresLoggedIn;
const requiresAdmin = require('../helpers/authHelper').requiresAdmin;
const SlackController = require('../controllers/slackController.js').SlackController;

function initSlackRouter(app) {

  /* BASIC SLACK ROUTES */
  /*****************************************************************
   * Basic health check                                            *
   *****************************************************************/ 
  app.post('/slack', (req, res) => {
    res.sendStatus(200);
  });

  /* SLACK USER ROUTES */
  /*****************************************************************
   * Routes to get, update, and delete existing Slack users.       *
   * /slack-users-fuzzy uses a fuzzy search to find users by name. *
   *****************************************************************/ 
  app.get('/slack-users-fuzzy', requiresLoggedIn, (req, res) => {
    SlackController.getSlackUsersFuzzy(req.query.firstName).then((users) => {
      res.send(users);
    }).catch((err) => {
      console.log(err);
      res.sendStatus(500);
    });
  });
  app.get('/slack-users', requiresLoggedIn, (req, res) => {
    SlackController.getSlackUsers(req.query).then((response) => {
      res.send(response);
    }).catch((err) => {
      console.error(err);
      res.sendStatus(500);
    });
  });
  app.patch('/slack-users', requiresLoggedIn, (req, res) => {
    SlackController.updateSlackUser(req.body, req.get('host')).then((user) => {
      res.send(user);
    }).catch((err) => {
      console.error(err);
      res.sendStatus(500);
    });
  });
  app.delete('/slack-users', requiresLoggedIn, (req, res) => {
    SlackController.deleteSlackUser(req.query).then((user) => {
      res.send(user);
    }).catch((err) => {
      console.error(err);
      res.sendStatus(500);
    });
  });

  /* SLACK USER DB ROUTES */
  /*****************************************************************
   * Routes to fill the DB with Slack users from the Slack API     *
   *****************************************************************/ 
  app.post('/update-db-from-slack', requiresAdmin, (req, res) => {
    SlackController.updateDbFromSlack(req.body).then((response) => {
      res.send(response);
    }).catch((err) => {
      console.log(err);
      res.sendStatus(500);
    });
  });

  /* SLACK USER ROUTES */
  /*****************************************************************
   * Routes to get Slack channels and store the selected channels  *
   * into the database for retrieval                               *
   *****************************************************************/ 
  app.get('/selected-channels', requiresAdmin, (req, res) => {
    SlackController.getSelectedChannels().then((response) => {
      res.send(response);
    }).catch((err) => {
      console.error(err);
      res.sendStatus(500);
    });
  })
  app.get('/slack-channels', requiresLoggedIn, (req, res) => {
    SlackController.getSlackChannels().then((response) => {
      res.send(response);
    }).catch((err) => {
      console.error(err);
      res.sendStatus(500);
    });
  });
  app.post('/slack-channels', requiresLoggedIn, (req, res) => {
    SlackController.postSelectedSlackChannels(req.body).then((response) => {
      res.send(response);
    }).catch((err) => {
      console.err(err);
      res.sendStatus(500);
    });
  });

  /* HELPER ROUTES */
  /*****************************************************************
   * Set user images.                                              *
   *****************************************************************/ 
  app.get('/assignUserImages', (req, res) => {
    SlackController.assignUserImages(req.get('host')).then((response) => {
      res.send(response);
    }).catch((err) => {
      console.error(err);
      res.sendStatus(500);
    });
  });
}

exports.initSlackRouter = initSlackRouter;
