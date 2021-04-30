const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const { locale } = require("../../locale");
const { config } = require("../../config");
const User = require("./model");

//List Users
const list = async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const skip = (page - 1) * limit;

  User.find({ active: true }, ["name", "username", "createdAt", "updatedAt"])
    .limit(Number(limit))
    .skip(skip)
    .sort({ createdAt: -1 })
    .then(async (users) => {
      const total = await User.estimatedDocumentCount();
      const totalPages = Math.ceil(total / limit);
      const hasMore = page < totalPages;

      res.status(200).json({
        hasMore,
        totalPages,
        total,
        data: users,
        currentPage: page,
      });
    });
};

//Create User
const create = async (req, res) => {
  const { name, email, username, password } = req.body;

  const user = {
    name,
    email,
    username,
    password,
  };

  const findUser = await User.find({ $or: [{ username }, { email }] }, [
    "email",
    "username",
  ]);

  if (findUser.length > 0) {
    res
      .status(500)
      .json({ message: locale.translate("errors.user.userExists") });
    return;
  }

  const newUser = new User(user);

  await newUser
    .save()
    .then((userCretaed) => {
      res.status(200).json(userCretaed);
    })
    .catch(() => {
      res
        .status(500)
        .json({ message: locale.translate("errors.user.onCreate") });
    });
};

//Update User
const update = async (req, res) => {
  const idParam = req.params.id;
  const { name, email, password } = req.body;

  if (name && email && password) {
    const user = {
      name,
      email,
      password,
    };

    const userFind = await findUserById(idParam);

    if (userFind) {
      const userUpdated = await User.updateOne(
        { _id: userFind._id },
        {
          $set: { name: user.name, email: user.email, password: user.password },
        }
      );

      if (userUpdated.ok === 1) {
        res.status(204).json();
      } else {
        res.status(500).json({
          message: `${locale.translate("errors.user.onUpdate")} ${idParam}`,
        });
      }
    } else {
      res.status(500).json({
        message: `${locale.translate("errors.user.userNotExist")} ${idParam}`,
      });
    }
  } else {
    res.status(500).json({ message: locale.translate("errors.invalidData") });
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

  if (condition) {
    
  } else {
    
  }
  const auth = await validateAuth(findUser, user);

  if (auth) {
    const token = jwt.sign({ userIdAuth: findUser._id }, config.jwtKey);
    res
      .status(200)
      .cookie("token", token, { maxAge: 60 * 60 * 24 * 1000, httpOnly: true })
      .json({
        data: {
          username: findUser.username,
          name: findUser.name,
        },
        message: "ok",
      });
  } else {
    console.log("no auth");
    res
      .status(500)
      .json({ message: locale.translate("errors.user.userNotExists") });
  }
};

//Remove User
const remove = async (req, res) => {
  const { userId } = req.body;
  const userFind = await findUserById(userId);
  if (userFind) {
    const userDeleted = await User.deleteOne({ _id: userFind._id });

    if (userDeleted.ok === 1) {
      res
        .status(200)
        .json({ message: locale.translate("errors.user.userDeleted") });
    } else {
      res.status(500).json({
        message: `${locale.translate("errors.user.onDelete")} 
      ${userFind.username}`,
      });
    }
  } else {
    res.status(500).json({
      message: `${locale.translate("errors.user.userNotExist")}`,
    });
  }
};

//validate User
const validateAuth = async (findUser, userReq) => {
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
    .then((user) => {
      return user;
    })
    .catch((err) => {
      console.error(err);
    });

  return userFound;
};

//Find User By Id
const findUserById = async (userId) => {
  const userFound = await User.findOne({ _id: userId })
    .then((user) => {
      return user;
    })
    .catch((err) => {
      console.error(err);
    });

  return userFound;
};

//Export Module
module.exports = {
  list,
  create,
  update,
  login,
  remove,
};
