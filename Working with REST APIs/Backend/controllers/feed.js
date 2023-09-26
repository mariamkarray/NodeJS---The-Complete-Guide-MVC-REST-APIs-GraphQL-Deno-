const { validationResult } = require("express-validator");
const Post = require("../models/post");
const fs = require("fs");
const path = require("path");
const io = require("../socket");
const User = require("../models/user");
exports.getPosts = async (req, res, next) => {
  const currentPage = req.query.page || 1;
  const perPage = 2;
  let totalItems;
  totalItems = await Post.find().countDocuments();
  try {
    const posts = await Post.find()
      .populate("creator")
      .sort({ createdAt: -1 })
      .skip((currentPage - 1) * perPage)
      .limit(perPage);
    res.status(200).json({
      message: "Posts fetched succcessfully.",
      posts,
      totalItems,
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    // pass the error to the error handling middleware
    next(err);
  }
};

exports.createPost = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error("Validation failed");
    error.statusCode = 422;
    // exit the function and reach the error handling middleware
    throw error;
  }
  if (!req.file) {
    const error = new Error("No image provided.");
    error.statusCode = 422;
    throw error;
  }
  const title = req.body.title;
  const content = req.body.content;
  const image = req.file.path.replace("\\", "/");
  const post = new Post({
    title: title,
    image,
    content: content,
    creator: req.userId,
  });
  try {
    await post.save();
    const user = await User.findById(req.userId);
    user.posts.push(post); // add post to user
    await user.save(); // changes to the user object will be saved to the database before proceeding to the next line of code.
    // send to all connected clients
    io.getIO().emit("posts", {
      action: "create",
      post: { ...post._doc, creator: { _id: req.userId, name: user.name } },
    });
    res.status(201).json({
      message: "Post created successfully!",
      post,
      creator: { _id: user._id, name: user.name },
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    // pass the error to the error handling middleware
    next(err);
  }
};

exports.getPost = async (req, res, next) => {
  const postId = req.params.postId;
  const post = await Post.findById(postId).populate("creator");
  try {
    if (!post) {
      const error = new Error("Could not find post.");
      error.statusCode = 404;
      throw error; // throw to catch
    }
    res.status(200).json({ message: "Post fetched.", post });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.updatePost = async (req, res, next) => {
  const postId = req.params.postId;
  const image = req.file;
  const updatedTitle = req.body.title;
  const updatedContent = req.body.content;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const error = new Error("Validation failed, entered data is incorrect.");
    error.statusCode = 422; // Unprocessable Entity (Validation error)
  }

  const post = await Post.findById(postId).populate("creator");
  try {
    if (!post) {
      const error = new Error("Could not find post.");
      error.statusCode = 404; // Not Found error
      throw error; // catch() will catch this and forward with next()
    }
    if (post.creator._id.toString() !== req.userId) {
      console.log(post.creator.toString());
      console.log(req.userId);
      const error = new Error("Not authorized.");
      error.statusCode = 403; // autherization issue
      throw error; // catch() will catch this and forward with next()
    }
    post.title = updatedTitle;
    post.content = updatedContent;
    let result;
    if (image) {
      clearImage(post.image);
      post.image = image.path.replace("\\", "/");
      result = await post.save();
    } else {
      result = await post.save();
    }
    io.getIO().emit("posts", {
      action: "update",
      post: result,
    });
    res.status(200).json({ message: "Post updated!", post: result });
  } catch (err) {
    next(err);
  }
};

exports.deletePost = async (req, res, next) => {
  const postId = req.params.postId;
  const post = await Post.findById(postId);
  try {
    if (!post) {
      const error = new Error("Could not find post.");
      error.statusCode = 404; // Not Found error
      throw error; // catch() will catch this and forward with next()
    }
    if (post.creator.toString() !== req.userId) {
      const error = new Error("Not authorized.");
      error.statusCode = 403; // autherization issue
      throw error; // catch() will catch this and forward with next()
    }
    clearImage(post.image);
    await Post.findByIdAndRemove(postId);
    const user = await User.findById(req.userId);
    user.posts.pull(postId);
    const result = await user.save();
    console.log(result);
    io.getIO().emit("posts", {
      action: "delete",
      post: postId,
    });
    res.status(200).json({ message: "Deleted post." });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.getStatus = (req, res, next) => {
  User.findById(req.userId)
    .then((user) => {
      if (!user) {
        const error = new Error("Could not find user.");
        error.statusCode = 404; // Not Found error
        throw error; // catch() will catch this and forward with next()
      }
      res.status(200).json({
        message: "Status fetched successfully",
        status: user.status,
      });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.updateStatus = async (req, res, next) => {
  const updatedStatus = req.body.status;
  const user = await User.findByIdAndUpdate(req.userId);
  try {
    if (!user) {
      const error = new Error("Could not find user.");
      error.statusCode = 404; // Not Found error
      throw error; // catch() will catch this and forward with next()
    }
    user.status = updatedStatus;
    const result = await user.save();
    res
      .status(200)
      .json({ message: "User status updated!", status: result.status });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

const clearImage = (filePath) => {
  filePath = path.join(__dirname, "..", filePath);
  filePath = filePath.replace("\\", "/");
  fs.unlink(filePath, (err) => console.log(err));
};
