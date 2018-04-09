const jwt = require('jsonwebtoken');

/***************************************************************
 * A group of functions to help authorize users and check on   *
 * their authentication status.                                *
 ***************************************************************/  

// User must have the admin privelege to view pages
function requiresAdmin (req, res, next) {
  const data = getSessionData(req);
  if (!data || (data && (!data.loggedIn || !data.admin))) {
    return res.send(data);
  }
  return next();
}

// User must be logged in to view pages
function requiresLoggedIn  (req, res, next) {
  const data = getSessionData(req);
  if (!data || (data && !data.loggedIn)) {
    return res.send(data);
  }
  return next();
}

// Check the JWT to see if the user is logged in and with what priveleges
function getSessionData (req) {
  let token = req.body.token || req.query.token || req.headers.authorization;
  const headerPrefix = 'Bearer ';
  if (token && token !== 'null') {
    if (token.indexOf(headerPrefix) >= 0) {
      token = token.substring(token.indexOf(headerPrefix) + headerPrefix.length)
    }
    let sessionData = null;
    const response = jwt.verify(token, process.env.JWT_STRING, (err, decoded) => {
      if (err) {
        return {loggedIn: false, message: err.message};
      };
      sessionData = decoded;
      sessionData.loggedIn = true;
      return sessionData;
    });
    return response;
  }
  return {loggedIn: false, message: 'No token sent'};
}

// Create a new token
function createToken (data, expiresIn) {
  return jwt.sign(JSON.parse(JSON.stringify(data)), process.env.JWT_STRING, {expiresIn: expiresIn});
}

// Create an API key for the front-end to use
function createApiKey () {
  return jwt.sign({user: 'API', admin: 0}, process.env.JWT_STRING);
}

exports.getSessionData   = getSessionData
exports.requiresAdmin    = requiresAdmin;
exports.requiresLoggedIn = requiresLoggedIn;
exports.createToken      = createToken;
exports.createApiKey     = createApiKey;

