const path = require("path");

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const multer = require("multer");
const { graphqlHTTP } = require("express-graphql");
const { v4: uuidv4 } = require("uuid");
const app = express();
const cors = require("cors");
var { MONGODB_URI } = require("./util/URI");
const graphqlSchema = require("./graphql/schema");
const graphqlResolver = require("./graphql/resolvers");
const auth = require("./middleware/auth");
const { clearImage } = require("./util/file");
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "images");
  },
  filename: function (req, file, cb) {
    cb(null, uuidv4());
  },
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

// parses application/json headers
app.use(bodyParser.json());
app.use(multer({ storage: storage, fileFilter: fileFilter }).single("image"));
// any request that goes to /images
// join constructs an absolute path to the images folder
// dirname: gives access to directory path to that file where we find images
app.use("/images", express.static(path.join(__dirname, "images")));
app.use(cors());
app.options("*", cors());
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "*");
  res.setHeader("Access-Control-Allow-Headers", "*");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

app.use(auth);

app.put("/post-image", (req, res, next) => {
  if (!req.isAuth) {
    throw new Error("Not authenticated");
  }
  if (!req.file) {
    return res.status(200).json({ message: "No file provided!" });
  }
  if (req.body.oldPath) {
    clearImage(req.body.oldPath);
  }
  return res.status(201).json({
    message: "File stored",
    filePath: req.file.path.replace("\\", "/"),
  });
});

app.use(
  "/graphql",
  graphqlHTTP({
    schema: graphqlSchema,
    rootValue: graphqlResolver,
    graphiql: true, // a special tool that allows testing the graphql queries
    // formatError(err) {
    //   // original error is an error thrown by graphql
    //   if (!err.originalError) {
    //     return err;
    //   }
    //   const data = err.originalError.data;
    //   const message = err.message || "An error occured";
    //   const code = err.originalError.code || 500;
    //   return { message: message, status: code, data: data };
    // },
    customFormatErrorFn: (error) => ({
      message: error.message || "An error occurred.",
    }),
  })
);

// error handling middleware
app.use((error, req, res, next) => {
  console.log(error);
  const status = error.statsCode || 500;
  const message = error.message;
  console.log(error);
  res.status(status).json({
    message,
  });
});
mongoose
  .connect(MONGODB_URI)
  .then((result) => {
    console.log("Connected");
    app.listen(8080);
  })
  .catch((err) => console.log(err));
