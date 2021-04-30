const express = require("express");
const { list, create, update, login, logout, remove } = require("./controller");
const { logger } = require("../middlewares/logger");
const { validateUser, validateLogin } = require("../middlewares/validator");
const { authenticator } = require("../middlewares/authenticator");
const { authorization } = require("../middlewares/authorization");

const router = express.Router();

router.use(logger);

router
  .route("/") //
  .get(list)
  .delete(authenticator, authorization, remove)
  .post(validateUser, create);

router
  .route("/login") //
  .post(validateLogin, login);

router
  .route("/logout") //
  .get(logout);

router
  .route("/:id") //
  .put(authenticator, authorization, update);

module.exports = router;
