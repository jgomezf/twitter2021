const { verifyIfUserIsOwnsTweet } = require("../services/tweetService");

const { locale } = require("../../locale");
const { isAdmin } = require("../services/userService");

const usersAuthorization = async (req, res, next) => {
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
        .json({ message: locale.translate("errors.operationNotAllowed") });
    }
  }
};

const tweetsAuthorization = async (req, res, next) => {
  const { userId, tweetId } = req.body;
  const result = await verifyIfUserIsOwnsTweet(userId, tweetId);
  const isAdmin = await isUserAdmin(userId);

  if (result || isAdmin) {
    next();
  } else {
    res.status(403).json({
      message: locale.translate("errors.operationNotAllowed"),
    });
  }
};

module.exports = { usersAuthorization, tweetsAuthorization };
