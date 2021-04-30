const jwt = require("jsonwebtoken");

const { locale } = require("../../locale");
const { isAdmin } = require("../services/userService");

const authorization = async (req, res, next) => {
  const { userIdAuth } = req.body;
  const userId = req.params.id || req.body.userId;

  if (userIdAuth === userId) {
    next();
  } else {
    const isAuth = await isAdmin(userIdAuth);

    if (isAuth) {
      next();
    } else {
      res
        .status(500)
        .json({ message: locale.translate("errors.user.notAuthorized") });
    }
  }
};

module.exports = { authorization };
