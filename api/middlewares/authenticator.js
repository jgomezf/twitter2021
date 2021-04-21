const jwt = require('jsonwebtoken');
const { config } = require('../../config');
const { locale } = require('../../locale');

const authenticator = (req, res, next) => {
  const token = req.headers['x-access-token'];

  try {
    const decoded = jwt.verify(token, config.jwtKey);
    const username = decoded?.username;

    req.body.authUsername = username;

    next();
  } catch (error) {
    res
      .status(401)
      .json({ message: locale.translate('errors.users.notAuthenticated') });
  }
};

module.exports = { authenticator };
