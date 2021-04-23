const express = require('express');
const {
  list, create, update, login, remove,
} = require('./controller');
const { logger } = require('../middlewares/logger');
const { validateUser, validateLogin } = require('../middlewares/validator');
const { authenticator } = require('../middlewares/authenticator');
const { usersAuthorization } = require('../middlewares/authorization');

const router = express.Router();

router.use(logger);

router.route('/')
  .get(list)
  .delete(authenticator, usersAuthorization, remove)
  .post(validateUser, create);

router.route('/login')
  .post(validateLogin, login);

router.route('/:username')
  .put(update);

module.exports = router;
