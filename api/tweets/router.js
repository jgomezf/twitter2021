const express = require('express');
const { list, create, createComment, createlike } = require('./controller');
const { logger } = require('../middlewares/logger');
const { authenticator } = require('../middlewares/authenticator');
const { validateTweet, validateComment } = require('../middlewares/validator');
const { tweetsAuthorization } = require('../middlewares/authorization');


const router = express.Router();

router.use(logger);

router.route('/')
  .get(list)
  .post(authenticator, validateTweet, create);

router.route('/comments')
  .post(authenticator, validateComment, createComment);

router.route('/likes')
  .put(authenticator, createlike);

module.exports = router;
