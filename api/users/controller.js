const jwt = require('jsonwebtoken');

const { locale } = require('../../locale');
const { config } = require('../../config');
const User = require('./model');

const list = async (req, res) => {
  const users = await User.find({}, ['name', 'lastname']);
  res.status(200).json(users);
};

const create = async (req, res) => {
  const {
    name, email, username, password,
  } = req.body;

  const user = {
    name,
    email,
    username,
    password,
  };

  const userFind = await User.find({ $or: [{ username }, { email }] }, ['email', 'username']).exec();

  if (userFind.length > 0) {
    res.status(500).json({ message: locale.translate('errors.userExist') });
    return;
  }

  const newUser = new User(user);
  await newUser.save();

  try {
    const userCreated = await User.find({ $and: [{ username }, { email }] }, ['name', 'email', 'username']).exec();
    res.status(200).json(userCreated);
  } catch (error) {
    res.status(500).json(error);
  }
};

const update = async (req, res) => {
  const usernameParam = req.params.username;
  const {
    name, email, username, password,
  } = req.body;

  if (name && email && username && password) {
    const user = {
      name,
      email,
      username,
      password,
    };

    const userFind = await User.findOne({ username: usernameParam }).exec();

    if (userFind) {
      const userUpdated = await User.updateOne({ _id: userFind._id },
        { $set: { name: user.name, email: user.email, password: user.password } });

      userUpdated.ok === 1 
        ? res.status(204).json()
        : res.status(500).json({ message: `${locale.translate('errors.userNoUpdated')} ${usernameParam}` });
    } else {
      res.status(500).json({ message: `${locale.translate('errors.userNotExist')} ${usernameParam}` });
    }
  } else {
    res.status(500).json({ message: locale.translate('errors.invalidData') });
  }
};

const login = async (req, res) => {
  const { username, password } = req.body;

  const user = {
    username,
    password,
  };

  const userFound = await User.findOne({ username: user.username, password: user.password }).exec();

  if (userFound) {
    const token = jwt.sign({ username: user.username }, config.jwtKey);
    res.status(200).json({ token });
  } else {
    res.status(500).json({ message: 'User not exists or user and password don´t match' });
  }
};

const remove = async (req, res) => {
  const { username } = req.body;
  const userFind = await User.findOne({ username }).exec();

  if (userFind) {
    const userDeleted = await User.deleteOne({ _id: userFind._id });

    userDeleted.ok === 1
      ? res.status(200).json()
      : res.status(500).json({ message: `${locale.translate('errors.userNoDeleted')} ${username}` });
  } else {
    res.status(500).json({ message: `${locale.translate('errors.userNotExist')} ${usernameParam}` });
  }
};

module.exports = {
  list, create, update, login, remove,
};
