const mongoose     = require('mongoose');
// Mongoose async functions should return native Promises
mongoose.Promise   = Promise;

const sanitize     = require('mongo-sanitize');
const SlackUser    = require('../models/db_models/slackUser.js').SlackUser;
const User         = require('../models/db_models/user.js').User;
const SelectedChannels = require('../models/db_models/selectedChannels.js').SelectedChannels;

class DBHelper {
  constructor () {
    // Connect to MongoDB
    mongoose.connect(process.env.MONGODB_URI, {useMongoClient: true});

    const db = mongoose.connection;
    db.on('error', console.error.bind(console, 'connection error:'));
    db.once('open', () => {
      console.log('MONGODB CONNECTION ACCEPTED');
    });
  }

  cleanInputs (inputs) {
    return sanitize(inputs);
  }

  /* Slack Users */
  /*****************************************************************
   * DB manipulation/getters for Slack users                       *
   *****************************************************************/ 
  createSlackUser (data) {
    data = this.cleanInputs(data);
    const slackUser = new SlackUser(data);
    return new Promise((resolve, reject) => {
      slackUser.save().then((slackUser) => {
        resolve(slackUser);
      }).catch((err) => reject(err));
    });
  }

  getSlackUserBySlackId (slackId) {
    slackId = this.cleanInputs(slackId);
    return new Promise((resolve, reject) => {
      SlackUser.findOne({ slackId: slackId }).then((slackUser) => {
        resolve(slackUser);
      }).catch((err) => reject(err));
    });
  }

  getSlackUsers (data) {
    data = this.cleanInputs(data);
    const lowerData = {};
    for (const k in data) {
      lowerData[k] = new RegExp(data[k], "i");
    }
    return new Promise((resolve, reject) => {
      SlackUser.find(lowerData).then((slackUsers) => {
        if(slackUsers && slackUsers.length <= 1) {
          slackUsers = slackUsers[0];
        }
        resolve(slackUsers);
      }).catch((err) => reject(err));
    });
  }

  getSlackUsersFuzzy (name, nameFuzzySoundex, nameCharCode) {
    const directMatches = [];
    const nearMatches = [];
    return new Promise((resolve, reject) => {
      const slackUsers = SlackUser.find({}).then((slackUsers) => {
        const closeSlackUsers = slackUsers.filter((slackUser) => {
          let shortFuzzySoundex;
          let longFuzzySoundex;
          if (nameFuzzySoundex.length > slackUser.nameFuzzySoundex.length) {
            shortFuzzySoundex = slackUser.nameFuzzySoundex;
            longFuzzySoundex = nameFuzzySoundex;
          } else {
            shortFuzzySoundex = nameFuzzySoundex;
            longFuzzySoundex = slackUser.nameFuzzySoundex;
          }
          if (longFuzzySoundex.indexOf(shortFuzzySoundex) >= 0) {
            slackUser.difference = Math.abs(slackUser.nameCharCode - nameCharCode);
            if (slackUser.difference < 100) {
              return slackUser;
            }
          }
        });
        closeSlackUsers.sort((a, b) => {
          return a.difference - b.difference;
        });
        closeSlackUsers.forEach((slackUser, i) => {
          if (slackUser.firstName.toLowerCase() === name.toLowerCase()) {
            directMatches.push(slackUser);
          } else {
            nearMatches.push(slackUser);
          }
        });
        const finalSlackUserObj = {
          'directMatches': directMatches,
          'nearMatches': nearMatches
        }
        resolve(finalSlackUserObj);
      }).catch((err) => reject(err));
    });
  }

  updateSlackUser (data) {
    data = this.cleanInputs(data);
    return new Promise((resolve, reject) => {
      SlackUser.findByIdAndUpdate(data._id, { $set: data }, { new: true, runValidators: true }).then((slackUser) => {
        resolve(slackUser);
      }).catch((err) => reject(err));
    });
  }

  deleteSlackUserBySlackId (slackId) {
    slackId = this.cleanInputs(slackId);
    return new Promise((resolve, reject) => {
      const slackUser = SlackUser.deleteOne({ slackId: slackId }).then((results) => {
        resolve(results);
      }).catch((err) => reject(err));
    });
  }

  clearDataSlack () {
    return new Promise((resolve, reject) => {
      SlackUser.remove({}).then((err, data) => {
        resolve('All data deleted');
      }).catch((err) => reject(err));
    });
  }
  /* /Slack Users */


  /* Management Users */
  /*****************************************************************
   * DB manipulation/getters for management users                  *
   *****************************************************************/ 
  getUsers (data) {
    data = this.cleanInputs(data);
    if (!data) data = {};
    return new Promise((resolve, reject) => {
      User.find(data).select({ 'password': false }).then((users) => {
        resolve(users);
      }).catch((err) => reject(err));
    });
  }

  getUserById (id) {
    id = this.cleanInputs(id);
    return new Promise((resolve, reject) => {
      User.findById(id).then((user) => {
        resolve(user);
      }).catch((err) => reject(err));
    });
  }

  getUserByUsername (username) {
    username = this.cleanInputs(username);
    return new Promise((resolve, reject) => {
      User.findOne({username: username}).select().then((user) => {
        resolve(user);
      }).catch((err) => reject(err));
    });
  }

  updateUser (data) {
    data = this.cleanInputs(data);
    return new Promise((resolve, reject) => {
      User.findByIdAndUpdate(data._id, {$set: data}, {new: true, runValidators: true}).then((user) => {
        resolve(user);
      });
    }).catch((err) => reject(err));
  }

  createUser (data) {
    data = this.cleanInputs(data);
    return new Promise((resolve, reject) => {
      // Need to filter data so that users cannot set themselves as Admins by passing a request.
      const filteredData = {
        username: data.username,
        password: data.password
      };
      User.count({}).then((count) => {
        if (count === 0) {
          filteredData.admin = 1;
          filteredData.verified = true;
        }
        const user = new User(filteredData);
        user.save((err) => {
          if(err) reject(err);
          // Need to clone the user to delete the password for some reason. Haven't got the reason yet.
          const userClone = JSON.parse(JSON.stringify(user));
          delete userClone.password;
          resolve(userClone);
        });
      }).catch((err) => reject(err));
    });
  }

  clearDataUsers () {
    return new Promise((resolve, reject) => {
      User.remove({}).then((data) => {
        resolve('All data deleted');
      }).catch((err) => reject(err));
    });
  }
  /* /Management Users */

  /* Slack Channel */
  /*****************************************************************
   * DB manipulation/getters for Slack channels                    *
   *****************************************************************/ 
  getSelectedChannels () {
    return new Promise((resolve, reject) => {
      SelectedChannels.findOne().then((channelInfo) => {
        resolve(channelInfo);
      });
    });
  }

  saveCheckedChannels (data) {
    return new Promise((resolve, reject) => {
      SelectedChannels.findOneAndUpdate({}, {teams: data}, {upsert: true, new: true}).then((doc) => {
        resolve('DB Updated');
      });
    });
  }
  /* /Slack Channel */

}

exports.DBHelper = new DBHelper();
