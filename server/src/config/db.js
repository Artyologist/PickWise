const mongoose = require('mongoose');

module.exports = {
  connect: async (uri) => {
    return mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
  }
};
