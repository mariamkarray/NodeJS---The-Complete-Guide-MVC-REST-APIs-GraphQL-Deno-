const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Post = require("../models/post");
const userSchema = new Schema({
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    default: "I am new!",
  },
  posts: {
    type: [
      {
        type: Schema.Types.ObjectId,
        ref: "Post",
      },
    ],
    required: true,
  },
});

module.exports = mongoose.model("User", userSchema);
