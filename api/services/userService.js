const User = require("../users/model");

const isAdmin = async (userId) => {
  const userAdmin = await User.find({
      $and: [{ _id: userId }, { role: "admin" }],
  });

  if (userAdmin.length > 0) {
    return true;
  } else {
    return false;
  }
};

module.exports = { isAdmin };
