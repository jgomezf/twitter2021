const express = require('express');
const { list, create } = require('./controller')
const { logger } = require('../middlewares/logger');
const { authenticator } = require('../middlewares/authenticator');
const { validateTweet } = require('../middlewares/validator');
const router = express.Router();

router.use(logger);

router.route('/')
    .get(list)
    .post(authenticator, validateTweet, create);

module.exports = router;