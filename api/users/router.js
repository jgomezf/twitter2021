const express = require('express');
const { list, create, update, login, remove } = require('./controller')
const { logger } = require('../middlewares/logger');
const { validatUser, validateLogin } = require('../middlewares/validator');
const { authenticator } = require('../middlewares/authenticator');
const { usersAuthorization } = require('../middlewares/authorization');
const router = express.Router();

router.use(logger);

router.route('/')
    .get(authenticator, list)
    .delete(authenticator, usersAuthorization, remove)
    .post(validatUser, create);

router.route('/login')
    .post(validateLogin, login);

router.route('/:username')
    .put(update);
    
module.exports = router;