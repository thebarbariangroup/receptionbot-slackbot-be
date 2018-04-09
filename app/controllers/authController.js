const bcrypt   = require('bcrypt');
const DBHelper = require('../helpers/dBHelper.js').DBHelper;
const createToken = require('../helpers/authHelper').createToken;

//Expires in 1 week, in milliseconds
const expiresIn = 7 * 100 * 60 * 60 * 24;

class AuthController {
  constructor() {
  }

  /* BASIC AUTH */
  /*****************************************************************
   * Sign in, log out, and sign up users.                          *
   *****************************************************************/ 
  signUp(data) {
    return new Promise((resolve, reject) => {
      bcrypt.hash(data.password, 10).then((hash) => {
        data.password = hash;
        DBHelper.createUser(data).then((user) => {
          resolve({
            message: 'An admin needs to verify your account'
          });
        }).catch((err) => reject(err));
      });
    });
  }

  logIn(data) {
    return new Promise((resolve, reject) => {
      DBHelper.getUserByUsername(data.username).then((user) => {
        if (!user) {
          reject({loggedIn: false, message: 'No user found'});
        }
        if (!user.verified) {
          reject({loggedIn: false, message: 'User has not been verified by an admin'});
        }
        bcrypt.compare(data.password, user.password).then((result) => {
          if (result) {
            resolve(this.logInUser(user));
          }
          reject({loggedIn: false, message: 'Password incorrect'});
        }).catch((err) => reject(err));
      }).catch((err) => reject(err));
    })
  }

  logInUser(user) {
    const token = createToken(user, expiresIn);
    return ({
      loggedIn: true,
      token: token,
      expiresIn: expiresIn
    });
  }

  verifyUser(data) {
    return new Promise((resolve, reject) => {
      DBHelper.updateUser(data).then((user) => {
        if (!user) {
          reject('No user found');
        }
        resolve(user);
      }).catch((err) => reject(err));
    });
  }

  /* USERS */
  /*****************************************************************
   * Get users from the db                                         *
   *****************************************************************/ 

  getUsers(data) {
    return new Promise((resolve, reject) => {
      DBHelper.getUsers(data).then((users) => {
        resolve(users);
      }).catch((err) => reject(err));
    });
  }

  getUserById(id) {
    return new Promise((resolve, reject) => {
      DBHelper.getUserById(id).then((user) => {
        if (!user) {
          reject('No user found');
        }
        resolve(user);
      }).catch((err) => reject(err));
    });
  }

}


exports.AuthController = new AuthController();
