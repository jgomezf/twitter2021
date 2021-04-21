const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const { locale } = require('../../locale');
const { config } = require('../../config');
const User = require('./model');

const list = async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const skip = (page - 1) * limit;
  

  User.find({ active: true }
    , ['name', 'username', 'createdAt', 'updatedAt'])
    .limit(Number(limit))
    .skip(skip)
    .sort({ createdAt: -1})
    .then(async (users) => {
      const total = await User.estimatedDocumentCount();
      const totalPages = Math.ceil(total / limit);
      const hasMore = page < totalPages;

      res.status(200).json({
        hasMore,
        totalPages,
        total,
        users,
        currentPage: page,
      });
    });
    

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

  const findUser = await findUserByUsername(user.username);
  const auth = await validateAuth(findUser, user);

  console.log(findUser._id);
  if (auth) {
    const token = jwt.sign({ userId: findUser._id }, config.jwtKey);
    res.status(200).json({ token });
  } else {
    res.status(500).json({ message: locale.translate('errors.user.userNotExists') });
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
const validateAuth = async (findUser, userReq) =>{  
  if (findUser) {
      const compare = bcrypt.compareSync(userReq.password, findUser.password);
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
