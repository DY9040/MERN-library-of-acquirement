const mongoose = require('mongoose');

mongoose.connect(
  process.env.MONGODB_URI || 'mongodb://localhost:27017/mern-library-of-acquirement', 
  {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}
);

module.exports = mongoose.connection;
