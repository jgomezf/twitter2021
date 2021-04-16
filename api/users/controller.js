const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

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
  const salt = bcrypt.genSaltSync(config.saltRounds);
  const passwordHash = bcrypt.hashSync(password, salt);

  const user = {
    name,
    email,
    username,
    password: passwordHash,
  };

  //pendiente validar si existe el username
  
  const newUser = new User(user);
  await newUser.save();

  try {
    const users = await User.find({}, ['name', 'username']);
      res.status(200).json(users);
  } catch (error) {
    res.status(500).json(error);
  }

};

const update = (req, res) => {
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

    const position = users.findIndex((u) => u.username === usernameParam);

    if (position !== -1) {
      users[position] = user;
      res.status(204).json(users);
    } else {
      res.status(500).json({ message: `No existe el usuario ${usernameParam}` });
    }
  } else {
    res.status(500).json({ message: 'Hay datos nulos' });
  }
};

const login = (req, res) => {
  const { username, password } = req.body;

  const user = {
    username,
    password,
  };

  const found = users.filter((u) => u.username === user.username && u.password === user.password);

  if (found && found.length > 0) {
    const token = jwt.sign({ username: user.username }, config.jwtKey);
    res.status(200).json({ token });
  } else {
    res.status(500).json({ message: 'User not exists or user and password don´t match' });
  }
};

const remove = (req, res) => {
  const { username } = req.body;
  users = users.filter((u) => u.username !== username);

  res.status(200).json(users);
};

module.exports = {
  list, create, update, login, remove,
};
