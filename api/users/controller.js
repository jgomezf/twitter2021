const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const { locale } = require("../../locale");
const { config } = require("../../config");
const User = require("./model");
const { newAccount } = require("../services/mailerService");

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

//One User
const getOne = async (req, res) => {
  const { id } = req.params;

  User.findById({ _id: id, active: true }, [
    "name",
    "username",
    "email",
    "createdAt",
    "updatedAt",
  ]).then(async (user) => {
    res.status(200).json({
      data: user,
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
      newAccount(user.email);

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

    let userFind = await findUserById(idParam);

    if (userFind) {
      const userUpdated = await User.updateOne(
        { _id: userFind._id },
        {
          $set: { name: user.name, email: user.email, password: user.password },
        }
      );

      if (userUpdated.ok === 1) {
        userFind = await findUserById(idParam);
        res.status(200).json({ data: userFind });
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
    res
      .status(500)
      .json({ message: locale.translate("errors.validate.emptyData") });
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

  if (findUser) {
    const auth = await validateAuth(findUser, user);
    // eslint-disable-next-line no-underscore-dangle
    const userId = findUser._id;

    if (auth) {
      const token = jwt.sign({ userIdAuth: findUser._id }, config.jwtKey);
      const cookieProps = {
        domain: "", //url del front
        maxAge: 60 * 60 * 24 * 1000,
        httpOnly: true,
      };
      res
        .status(200)
        .cookie("token", token, cookieProps)
        .json({
          data: {
            id: userId,
            username: findUser.username,
            name: findUser.name,
            email: findUser.email,
            token: token,
          },
          message: "ok",
        });
    } else {
      res.status(500).json({
        message: locale.translate("errors.userNotAuthenticated"),
      });
    }
  } else {
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
        .json({ message: locale.translate("success.user.userDeleted") });
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

const logout = (req, res) => {
  res.clearCookie("token").json({ message: "ok" });
};

//Export Module
module.exports = {
  getOne,
  list,
  create,
  update,
  remove,
  login,
  logout,
};
