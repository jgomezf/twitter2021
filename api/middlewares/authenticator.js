const jwt = require('jsonwebtoken');
const { config } = require('../../config');
const { locale } = require('../../locale');

const authenticator = (req, res, next) => {
  const token = req.headers['x-access-token'];

  try {
    const decoded = jwt.verify(token, config.jwtKey);
    const userId = decoded?.userId;

    req.body.userId = userId;

    next();
  } catch (error) {
    res
      .status(401)
      .json({ message: locale.translate('errors.user.notAuthenticated') });
  }
};

module.exports = { authenticator };
