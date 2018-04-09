const mongoose  = require('mongoose');

class UserModel {
  constructor(mongoose) {
    this.mongoose = mongoose;
    this.model = this.createModel();
  }

  createModel() {
    const userSchema = this.mongoose.Schema({
      username: {
        type: String,
        required: [true, 'username is required'],
        unique: true
      },
      password: {
        type: String,
        required: [true, 'password is required']
      },
      admin: {
        type: Number,
        default: 0
      },
      verified: {
        type: Boolean,
        default: false
      }
    });

    return this.mongoose.model('User', userSchema);
  }
}

exports.User = new UserModel(mongoose).model;
