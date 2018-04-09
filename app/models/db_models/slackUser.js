const mongoose  = require('mongoose');

class SlackUserModel {
  constructor (mongoose) {
    this.mongoose = mongoose;
    this.model = this.createModel();
  }

  createModel () {
    const slackUserSchema = this.mongoose.Schema({
      slackName: {
        type: String,
        required: [true, 'slackName is required'],
      },
      slackId: {
        type: String,
        required: [true, 'slackId is required'],
        unique: true
      },
      firstName: {
        type: String,
        required: [true, 'firstName is required'],
      },
      lastName: {
        type: String,
        required: [true, 'lastName is required'],
      },
      email: {
        type: String,
        required: [true, 'email is required'],
      },
      nameCharCode: {
        type: String
      },
      nameFuzzySoundex: {
        type: String
      },
      imageURI: {
        type: String
      }
    });

    slackUserSchema.methods = {
      areDiffs: this.areDiffs
    };

    return this.mongoose.model('SlackUser', slackUserSchema);
  }

  areDiffs (slackUserSrc) {
    for (let key in slackUserSrc) {
      if(this[key] && slackUserSrc[key] && this[key] !== slackUserSrc[key]) {
        return true
      }
    }
    return false;
  }
}

exports.SlackUser = new SlackUserModel(mongoose).model;
