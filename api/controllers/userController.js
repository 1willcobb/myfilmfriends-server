const prisma = require('../prisma/client');

const getUsers = async (req, res, next) => {
  try {
    const users = await prisma.user.findMany(); // Directly using Prisma client
    res.json(users);
  } catch (err) {
    next(err);
  }
};

const createUser = async (req, res, next) => {
  try {
    const user = await prisma.user.create({
      data: req.body,
    });
    res.status(201).json(user);
  } catch (err) {
    next(err);
  }
};

// Other CRUD actions: updateUser, deleteUser, etc.

module.exports = {
  getUsers,
  createUser,
};
