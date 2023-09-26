const path = require("path");

const express = require("express");
const bodyParser = require("body-parser");
const feedRoutes = require("./routes/feed");
const authRoutes = require("./routes/auth");
const mongoose = require("mongoose");
const multer = require("multer");
const { v4: uuidv4 } = require("uuid");
const app = express();
const cors = require("cors");
var { MONGODB_URI } = require("./util/URI");

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
  next();
});

// forward any GET /feed/posts incoming request
app.use("/feed", feedRoutes);
app.use("/auth", authRoutes);

app.use((error, req, res, next) => {
  console.log(error);
  const status = error.statsCode || 500;
  const message = error.message;
  res.status(status).json({
    message,
  });
});
mongoose
  .connect(MONGODB_URI)
  .then((result) => {
    const server = app.listen(8080);
    // socket.io is imported and initialized with the prev http server
    const io = require("./socket").init(server, {
      cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"],
      },
    });
    // When a client successfully establishes a WebSocket connection with the server, this event is triggered.
    io.on("connection", (socket) => {
      console.log("Client connected");
    });
  })
  .catch((err) => console.log(err));
