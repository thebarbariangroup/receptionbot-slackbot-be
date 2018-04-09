const imageHelper = require('../helpers/imageHelper.js').imageHelper;


class ImageController {
  
  /* IMAGES */
  /*****************************************************************
   * Get images                                                    *
   *****************************************************************/
  getImage(id) {
    return new Promise((resolve, reject) => {
      imageHelper.getImage(id).then((response) => {
        resolve(response);
      }).catch((err) => {reject(err)});
    });
  }

}


exports.ImageController = new ImageController();
