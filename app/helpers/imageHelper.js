const SlackUserImage = require('../models/db_models/slackUserImage.js').SlackUserImage;


class ImageHelper {

  uploadImage (imageData, id) {
    return new Promise ((resolve, reject) => {
      const imageType = imageData.match(/^data:image\/(.*);base64,/)[1];
      const base64Data = imageData.replace(/^data:image\/(.*);base64,/, "");
      const buf = new Buffer (base64Data, 'base64');

      SlackUserImage.findOne({ slackUserId: id}).then((existingImage) => {
        if (existingImage) {
          existingImage.data = buf;
          existingImage.save().then((image) => {
            resolve(image);
          }).catch((err) => reject(err));
        } else {
          const newImage = new SlackUserImage({
            slackUserId: id,
            data: buf,
            contentType: imageType
          });
          newImage.save().then((newImage) => {
            resolve(newImage);
          }).catch((err) => reject(err));
        }
      });
    });
  }

  getImage (id) {
    return new Promise((resolve, reject) => {
      SlackUserImage.findOne({ slackUserId: id }).then((image) => {
        resolve(image);
      }).catch((err) => reject(err));
    });
  }

}

exports.imageHelper = new ImageHelper()