const express = require("express");
const {
  getOne,
  list,
  create,
  destroyTweet,
  createComment,
  likes,
  getExternalTweetsByUsername,
} = require("./controller");
const { logger } = require("../middlewares/logger");
const { authenticator } = require("../middlewares/authenticator");
const { validateTweet, validateComment } = require("../middlewares/validator");
const { tweetsAuthorization } = require("../middlewares/authorization");

const router = express.Router();

router.use(logger);

router
  .route("/")
  .get(authenticator, list)
  .post(authenticator, validateTweet, create)
  .delete(authenticator, tweetsAuthorization, destroyTweet);

router.route("/:id").get(authenticator, getOne);

router.route("/comments").post(authenticator, validateComment, createComment);

router.route("/likes").post(authenticator, likes);

router.route("/external/:username").get(getExternalTweetsByUsername);

module.exports = router;
