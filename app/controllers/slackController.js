const SlackBotController = require('./slackBotController.js').SlackBotController;
const DBHelper = require('../helpers/dBHelper.js').DBHelper;
const rogerRoot = require('talisman/phonetics/roger-root');
const fuzzySoundex = require('talisman/phonetics/fuzzy-soundex');
const imageHelper = require('../helpers/imageHelper.js').imageHelper;
const glob = require('glob');

const fs = require('fs');
const os = require('os');

class SlackController {
  
  /* SLACK USERS */
  /*****************************************************************
   * Get, modify and delete Slack users in our DB.                 *
   *****************************************************************/ 

  getSlackUsersFuzzy (name) {
    return new Promise((resolve, reject) => {
      DBHelper.getSlackUsersFuzzy(name, fuzzySoundex(name), rogerRoot(name)).then((slackUsers) => {
        resolve(slackUsers);
      }).catch((err) => {
        reject(err);
      });
    });
  }
  getSlackUsers (options) {
    return new Promise((resolve, reject) => {
      DBHelper.getSlackUsers(options).then((response) => {
        if (response && !response.length) {
          response = [response];
        }
        resolve(response);
      }).catch((err) => {reject(err)});
    });
  }

  updateSlackUser (data, hostName) {
    return new Promise((resolve, reject) => {
      if (data.newImage) {
        imageHelper.uploadImage(data.newImage, data.slackId).then((image) => {
          data.imageURI = `//${hostName}/assets/user_images/${data.slackId}.${image.contentType}`;
          data.newImage = '';
          this.finishUpdateSlackUser(data).then((slackUser) => {
            resolve(slackUser);
          }).catch((err) => {reject(err)});
        }).catch((err) => reject(err));
      } else {
        this.finishUpdateSlackUser(data).then((slackUser) => {
          resolve(slackUser);
        }).catch((err) => {reject(err)});;
      }
    });
  }

  finishUpdateSlackUser (data) {
    return new Promise((resolve, reject) => {
      DBHelper.updateSlackUser(data).then((slackUser) => {
        resolve(slackUser);
      }).catch((err) => {
        reject(err);
      });
    });
  }

  deleteSlackUser (data) {
    return new Promise((resolve, reject) => {
      const slackId = data.slackId;
      if(!slackId) {
        reject('No slackId provided');
      }
      DBHelper.deleteSlackUserBySlackId(slackId).then((results) => {
        resolve(results);
      }).catch((err) => {
        reject(err);
      });
    });
  }

  /* SLACK USERS FROM API */
  /*****************************************************************
   * Get Slack users from the Slack API and store them in the DB.  *
   *****************************************************************/ 
  updateDbFromSlack (data) {
    return new Promise((resolve, reject) => {
      const tasks = Promise.all([this.loadDBSlack(data), this.saveCheckedChannels(data)]);
      tasks.then((results) => {
        resolve('DB Updated');
      });
    });
  }

  loadDBSlack (data) {
    const doNotDelete = [];
    return new Promise((resolve, reject) => {
      SlackBotController.getSlackUsers(data).then((slackUsersSrc) => {
        this.getSlackUsers().then((slackUsersDB) => {
          slackUsersSrc.forEach((slackUserSrc) => {
            const slackUserSrcFormatted = this.formatSlackUserData(slackUserSrc)
            // If we cannot format the user, skip them
            if(!slackUserSrcFormatted) { return; }
            const slackUserDB = this.getSlackUserFromArray(slackUsersDB, slackUserSrcFormatted);
            if (slackUserDB) {
              doNotDelete.push(slackUserDB._id);
              this.updateSlackUserFromSrc(slackUserDB, slackUserSrcFormatted);
            } else {
              DBHelper.createSlackUser(slackUserSrcFormatted).then((slackUser) => {
                //noop
              }).catch((err) => {
                console.error(err);
                console.error('User for Error:', slackUserSrc);
              });
            }
          });
          this.deleteNonExistantSlackUsers(slackUsersDB, doNotDelete);
          resolve ("DB updated");
        }).catch((err) => reject(err));
      }).catch((err) => reject(err));
    });
  }


  getSlackUserFromArray  (slackUsersDB, slackUserSrc) {
    if (slackUsersDB) {
      return slackUsersDB.find((slackUserDB) => {
        return slackUserDB.slackId === slackUserSrc.slackId;
      });
    }
  }

  updateSlackUserFromSrc  (slackUserDB, slackUserSrc) {
    if (slackUserDB.areDiffs(slackUserSrc)) {
      // Make sure we don't overwrite User custom images.
      slackUserSrc.imageURI = slackUserDB.imageURI;
      slackUserSrc._id = slackUserDB._id; 
      this.updateSlackUser(slackUserSrc);
    }
  }

  deleteNonExistantSlackUsers  (slackUsersDB, doNotDelete) {
    if(slackUsersDB) {
      slackUsersDB.forEach((slackUserDB) => {
        if (doNotDelete.indexOf(slackUserDB._id) === -1) {
          this.deleteSlackUser(slackUserDB);
        }
      });
    }
  }

  /* SLACK CHANNELS FROM API */
  /*****************************************************************
   * Get Slack channels from the Slack API and store them in the   *
   * DB.                                                           *
   *****************************************************************/ 
  saveCheckedChannels (data) {
    return new Promise((resolve, reject) => {
      DBHelper.saveCheckedChannels(data).then(() => {
        resolve('DB Updated');
      }).catch((err) => reject(err));
    });
  }


  getSlackChannels () {
    return new Promise((resolve, reject) => {
      const tasks = Promise.all([this.getSlackChannelsFromApi(), this.getSelectedChannels()]);
      tasks.then((results) => {
        const slackChannelsFromApi = results[0];
        const selectedChannels = results[1].teams;

        selectedChannels.forEach((team) => {
          const apiTeam = slackChannelsFromApi.find((apiTeam) => {
            return apiTeam.id === team.teamId;
          });
          if (apiTeam) {
            if (!team.channelIds) {
              return apiTeam.checked = true;
            }

            apiTeam.channels.forEach((apiChannel) => {
              if (team.channelIds.indexOf(apiChannel.id) >= 0) {
                apiChannel.checked = true;
              }
            });
          }
        });
        resolve(slackChannelsFromApi);
      });
    });
  }

  getSlackChannelsFromApi () {
    return new Promise((resolve, reject) => {
      SlackBotController.getSlackChannels().then((slackChannels) => {
        slackChannels.map((team) => {
          team.checked = false;
          team.channels.map((channel) => {
            channel.checked = false;
          });
        });
        resolve(slackChannels);
      }).catch((err) => {
        reject(err);
      });
    });
  }

  getSelectedChannels () {
    return new Promise((resolve, reject) => {
      DBHelper.getSelectedChannels().then((channels) => {
        resolve(channels);
      }).catch((err) => reject(err));
    });
  }

  /* SLACK HELPERS */
  /*****************************************************************
   * Some helper functions for formatting data.                    *
   *****************************************************************/ 

  assignUserImages (hostName) {
    return new Promise ((resolve, reject) => {
      DBHelper.getSlackUsers().then((slackUsers) => {
        slackUsers.forEach((slackUser, i) => {
          const slackId = slackUser.slackId;
          const fileURI = `${process.cwd()}/assets/user_images/${slackId}.*`;
          glob(fileURI, (err, files) => {
            if (err) { 
              console.error(err); 
              return; 
            }
            if (files.length > 0) {
              const newImage = files[0];
              const imagePath = newImage.substring(newImage.indexOf('/user_images'));
              slackUser.imageURI = '//' + hostName + imagePath;

              const data = {
                _id: slackUser._id,
                slackName: slackUser.slackName,
                slackId: slackUser.slackId,
                firstName: slackUser.firstName,
                lastName: slackUser.lastName,
                email: slackUser.email,
                nameCharCode: rogerRoot(slackUser.firstName),
                nameFuzzySoundex: fuzzySoundex(slackUser.firstName),
                imageURI: slackUser.imageURI
              }

              this.finishUpdateSlackUser(data).then(() => {

              }).catch((err) => { console.error(err) });
            }
          });
        });
        resolve("Done");
      }).catch((err) => {reject(err)});
    });
  }

  formatSlackUserData (slackUser) {
    let firstName, lastName;
    if (slackUser.profile.first_name) {
      firstName = slackUser.profile.first_name;
      lastName = slackUser.profile.last_name;
    } else {
      firstName = slackUser.real_name.substring(0, slackUser.real_name.indexOf(' '));
      lastName = slackUser.real_name.substring(slackUser.real_name.indexOf(' '));
    }
    if (firstName && lastName) {
      return {
        slackName: slackUser.name,
        slackId: slackUser.id,
        firstName: firstName,

        lastName: lastName,
        email: slackUser.profile.email,
        nameCharCode: rogerRoot(firstName),
        nameFuzzySoundex: fuzzySoundex(firstName),
        imageURI: slackUser.profile.image_512
      }
    }
  }
}


exports.SlackController = new SlackController();
