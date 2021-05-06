const express = require("express");
const {
  list,
  create,
  remove,
  createComment,
  createlike,
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
  .delete(authenticator, tweetsAuthorization, remove);

router.route("/comments").post(authenticator, validateComment, createComment);

router.route("/likes").put(authenticator, createlike);

module.exports = router;
