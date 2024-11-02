const { default: mongoose } = require("mongoose");

const tokenSchema = mongoose.Schema({
  token: {
    type: String,
  },
});

module.exports = mongoose.model("token", tokenSchema);
