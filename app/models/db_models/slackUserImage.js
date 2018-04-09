const mongoose  = require('mongoose');

class SlackUserImageModel {
  constructor (mongoose) {
    this.mongoose = mongoose;
    this.model = this.createModel();
  }

  createModel () {
    const slackUserImageSchema = this.mongoose.Schema({
      slackUserId: {
        type: String
      },
      data: {
        type: Buffer
      },
      contentType: {
        type: String
      }
    });

    return this.mongoose.model('SlackUserImage', slackUserImageSchema);
  }

}

exports.SlackUserImage = new SlackUserImageModel(mongoose).model;
