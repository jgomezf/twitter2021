const { locale } = require("../../locale");

const validateLogin = (req, res, next) => {
  const { username, password } = req.body;
  const errors = [];

  if (username && password) {
    if (username.length < 6) {
      errors.push(locale.translate("errors.validate.invalidUsername"));
    }
  } else {
    errors.push(locale.translate("errors.validate.emptyData"));
  }

  if (errors.length === 0) {
    next();
  } else {
    res.status(500).json({ message: errors });
  }
};

const validateTweet = (req, res, next) => {
  const { content } = req.body;
  const errors = [];

  if (content) {
    if (content.length > 280) {
      errors.push(locale.translate("errors.validate.maxCharactersAllowed"));
    }
  } else {
    errors.push(locale.translate("errors.validate.emptyData"));
  }

  if (errors.length === 0) {
    next();
  } else {
    res.status(500).json({ message: errors });
  }
};

const validateComment = (req, res, next) => {
  const { comment, tweetId } = req.body;
  const errors = [];

  if (comment && tweetId) {
    if (comment.length > 280) {
      errors.push(locale.translate("errors.validate.maxCharactersAllowed"));
    }
  } else {
    errors.push(locale.translate("errors.validate.emptyData"));
  }

  if (errors.length === 0) {
    next();
  } else {
    res.status(500).json({ message: errors });
  }
};

const validateUser = (req, res, next) => {
  const { name, email, username, password, passwordConfirmation } = req.body;
  const errors = [];

  if (name && email && password) {
    const regExpEmail = new RegExp(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/);
    const regExpPass = new RegExp(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})/
    );

    if (name.length < 3) {
      errors.push(locale.translate("errors.validate.invalidName"));
    }

    if (!regExpEmail.test(email)) {
      errors.push(locale.translate("errors.validate.invalidEmail"));
    }

    if (!regExpPass.test(password)) {
      errors.push(locale.translate("errors.validate.invalidPassword"));
    }

    if (req.method === "POST") {
      if (username && passwordConfirmation) {
        if (username.length < 6) {
          errors.push(locale.translate("errors.validate.invalidUsername"));
        }

        if (password !== passwordConfirmation) {
          errors.push(locale.translate("errors.validate.passwordsDontMatch"));
        }
      } else {
        errors.push(locale.translate("errors.validate.emptyData"));
      }
    }
  } else {
    errors.push(locale.translate("errors.validate.emptyData"));
  }

  if (errors.length === 0) {
    next();
  } else {
    res.status(500).json({ message: errors });
  }
};

module.exports = {
  validateUser,
  validateLogin,
  validateTweet,
  validateComment,
};
