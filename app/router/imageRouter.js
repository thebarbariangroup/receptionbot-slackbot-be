const ImageController = require('../controllers/imageController').ImageController;

function initImageRouter(app) {
  /* IMAGE ROUTES */
  /*****************************************************************
   * Saves images uploaded from a user into the filesystem.        *
   *****************************************************************/ 
  app.get('/assets/user_images/:id', (req, res) => {
    const slackUserId = req.params.id.substring(0, req.params.id.indexOf('.'));
    ImageController.getImage(slackUserId).then((image) => {
      res.writeHead(200, {
        'Content-Type': `image/${image.contentType}`,
        'Content-Length': image.data.length
      });
      res.end(image.data);
    });
  });
}

exports.initImageRouter = initImageRouter;
