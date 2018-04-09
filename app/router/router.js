const initSlackRouter = require('./slackRouter').initSlackRouter;
const initAuthRouter = require('./authRouter').initAuthRouter;
const initImageRouter = require('./imageRouter').initImageRouter;

function initRouter(app) {
  // Basic route for health check
  app.get('/', (req, res) => {
    res.sendStatus(200);
  });

  initAuthRouter(app);
  initSlackRouter(app);
  initImageRouter(app);
}

exports.initRouter = initRouter;
