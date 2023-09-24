const { validationResult } = require('express-validator');
const Post = require('../models/post')
const fs = require('fs')
const path = require('path')
const User = require('../models/user')
exports.getPosts = (req, res, next) => {
    const currentPage = req.query.page || 1
    const perPage = 2;
    let totalItems; 
    Post.find().countDocuments()
    .then(count => {
        totalItems = count
        return Post.find()
        .skip((currentPage - 1)  * perPage)
        .limit(perPage)
    })
    .then(posts => {
        res.status(200).json({
            message:'Posts fetched succcessfully.',
            posts,
            totalItems
     });
    })
    .catch(err => {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        // pass the error to the error handling middleware
        next(err)
    })
   
};

exports.createPost = (req, res, next) => {
    
    console.log(req.body)
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new Error('Validation failed');
        error.statusCode = 422;
        // exit the function and reach the error handling middleware
        throw error;
    }
    if (!req.file) {
        const error = new Error('No image provided.')
        error.statusCode = 422;
        throw error;
    }
    const title = req.body.title;
    const content = req.body.content;
    const image = req.file.path.replace("\\" ,"/");
    let creator;
    const post = new Post({
        title: title,
        image,
        content: content,
        creator: req.userId
    });
    post.save()
    .then(result => {
        console.log(result)
        return User.findById(req.userId)   
    })
    .then(user => {
        creator = user; 
        user.posts.push(post); // add post to user
        return user.save()
    })
    .then(result => {
        res.status(201).json({
            message: 'Post created successfully!',
            post,
            creator: {_id: creator, name: creator.name }
        })
    })
    .catch(err => {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        // pass the error to the error handling middleware
        next(err)
    })
}

exports.getPost = ((req, res, next) => {
    
    const postId = req.params.postId;
    const post = Post.findById(postId)
    .then( post => {
        if (!post) {
            const error = new Error('Could not find post.')
            error.statusCode = 404;
            throw error; // throw to catch
            }
            res.status(200).json({message: 'Post fetched.', post})
        })
    .catch(err => {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    })
})

exports.updatePost = (req, res, next) => {
    const postId = req.params.postId;
    const image = req.file;
    const updatedTitle = req.body.title;
    const updatedContent = req.body.content;
    const errors = validationResult(req);
   
    if (!errors.isEmpty()) {
      const error = new Error("Validation failed, entered data is incorrect.");
      error.statusCode = 422; // Unprocessable Entity (Validation error)
    }
   
    Post.findById(postId)
      .then((post) => {
        if (!post) {
          const error = new Error("Could not find post.");
          error.statusCode = 404; // Not Found error
          throw error; // catch() will catch this and forward with next()
        }
        if (post.creator.toString() !== req.userId) {
            const error = new Error("Not autherized.");
            error.statusCode = 403; // autherization issue
            throw error; // catch() will catch this and forward with next()
        } 
        post.title = updatedTitle;
        post.content = updatedContent;
        if (image) {
           clearImage(post.image)
           post.image = image.path.replace("\\", "/");
            return post.save();
        } else {
          return post.save();
        }
      })
      .then((result) => {
        res.status(200).json({ message: "Post updated!", post: result });
      })
      .catch((err) => {
        next(err);
      });
  };

exports.deletePost = (req, res, next) => {
    const postId = req.params.postId;
    Post.findById(postId)
      .then(post => {
        if (!post) {
          const error = new Error("Could not find post.");
          error.statusCode = 404; // Not Found error
          throw error; // catch() will catch this and forward with next()
        }
        if (post.creator.toString() !== req.userId) {
            const error = new Error("Not autherized.");
            error.statusCode = 403; // autherization issue
            throw error; // catch() will catch this and forward with next()
        } 
            clearImage(post.image)
            return Post.findByIdAndRemove(postId);
    })
    .then(result => {
       return User.findById(req.userId)
    })
    .then (user => {
        user.posts.pull(postId)
        return user.save();
    })
    .then(result => {
        console.log(result)
        res.status(200).json({message: 'Deleted post.'})
    })
    .catch(err => {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    })
}
exports.getStatus = (req, res, next) => {
    User.findById(req.userId)
    .then(user => {
        if (!user) {
            const error = new Error("Could not find user.");
            error.statusCode = 404; // Not Found error
            throw error; // catch() will catch this and forward with next()
          }
        res.status(200).json({
            message:'Status fetched successfully',
            status: user.status
     });
    })
    .catch(err => {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err)
    })
}

exports.updateStatus = (req, res, next) => {
    const updatedStatus = req.body.status
    User.findByIdAndUpdate(req.userId)
    .then(user => {
        if (!user) {
            const error = new Error("Could not find user.");
            error.statusCode = 404; // Not Found error
            throw error; // catch() will catch this and forward with next()
          }
        user.status = updatedStatus
        return user.save()
    })
    .then((result) => {
        res.status(200).json({ message: "User status updated!", status: result.status});
      })
    .catch(err => {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err)
    })
}

const clearImage = filePath => {
    filePath = path.join(__dirname, '..', filePath);
    filePath = filePath.replace("\\", "/");
    fs.unlink(filePath, err => console.log(err))
}