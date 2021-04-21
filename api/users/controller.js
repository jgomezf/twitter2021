const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const { locale } = require('../../locale');
const { config } = require('../../config');
const User = require('./model');

const list = async (req, res) => {
  const users = await User.find({ active: true }, ['name', 'username', 'createdAt', 'updatedAt']);
  res.status(200).json(users);
};

//Create User
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

  const findUser = await User.find({ $or: [{ username }, { email }] }, ['email', 'username']);

  if (findUser.length > 0) {
    res.status(500).json({ message: locale.translate('errors.user.userExists') });
    return;
  }

  const newUser = new User(user);
  
  await newUser.save()
    .then((userCretaed) => {
      res.status(200).json(userCretaed);
    })
    .catch(() => {
      res.status(500).json({ message: locale.translate('errors.user.onCreate')});
    });
};

//Update User
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

    const userFind = await findUserByUsername(usernameParam);

    if (userFind) {
      const userUpdated = await User.updateOne({ _id: userFind._id },
        { $set: { name: user.name, email: user.email, password: user.password } });

      userUpdated.ok === 1 
        ? res.status(204).json()
        : res.status(500).json({ message: `${locale.translate('errors.user.onUpdate')} ${usernameParam}` });
    } else {
      res.status(500).json({ message: `${locale.translate('errors.user.userNotExist')} ${usernameParam}` });
    }
  } else {
    res.status(500).json({ message: locale.translate('errors.invalidData') });
  }
};

//Login User
const login = async (req, res) => {
  const { username, password } = req.body;

  const user = {
    username,
    password,
  };

  const auth = await validateAuth(user);

  if (auth) {
    const token = jwt.sign({ username: user.username }, config.jwtKey);
    res.status(200).json({ token });
  } else {
    res.status(500).json({ message: 'User not exists or user and password don´t match' });
  }
};

//Remove User
const remove = async (req, res) => {
  const { username } = req.body;
  const userFind = await findUserByUsername(username);

  const userDeleted = await User.deleteOne({ _id: userFind._id });

  userDeleted.ok === 1
    ? res.status(200).json( {message: locale.translate('errors.user.userDeleted') })
    : res.status(500).json({ message: `${locale.translate('errors.user.onDelete')} ${username}` });
};

//validate User
const validateAuth = async (user) =>{    
  const userFound = await findUserByUsername(user.username);
  
  if (userFound) {
      const compare = bcrypt.compareSync(user.password, userFound.password);
      return compare;
  } else {
      return false;
  }
};

//Find User By Username
const findUserByUsername = async (username) => {
  const userFound = await User.findOne({ username })
                              .then(user =>{
                                  return user;
                              })
                              .catch( err => {
                                  console.error(err);
                              });

  return userFound;
};

//Export Module
module.exports = {
  list, create, update, login, remove,
};
