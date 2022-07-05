const User = require('../models/user');

module.exports = async (req, res, next) => {
  const user = await User.findById(req.userId);
  const error = new Error('Not an Admin.');
  error.statusCode = 401;
  console.log(user.admin)
  if (!user.admin) throw error;
  next();
};
