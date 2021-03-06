const jwt = require("jsonwebtoken");
const { config } = require("../../config");
const { locale } = require("../../locale");

const authenticator = (req, res, next) => {
  const token = req.cookies.token || req.headers.authorization;

  try {
    const decoded = jwt.verify(token, config.jwtKey);
    const userIdAuth = decoded.userIdAuth;

    req.body.userIdAuth = userIdAuth;

    next();
  } catch (error) {
    res
      .status(401)
      .json({ message: locale.translate("errors.notAuthenticated") });
  }
};

module.exports = { authenticator };
