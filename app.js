// Loading Environment Variables
require("dotenv").config({ path: `/var/www/env/.env` });
require("dotenv").config();
console.log(`*** Using ${process.env.NODE_ENV} Environment Variables ***`);
const {
  AMD_DB_CONNECT: amdDatabase,
  DEV_URL: devUrl,
  SRV_URL: srvUrl,
  PORT: port,
  POST_CRED: postPassword,
} = process.env;

// Dependancies
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const { amdNavVersionCheck } = require("./functions/amd/amdFunctions");

// Connect to database -------------------------------------------------------------------------------
mongoose.connect(
  amdDatabase,
  {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
  },
  () => {
    console.log("*** Connected to AmdDB ***");
    // Version check and print for database collections
    amdNavVersionCheck("header", true);
    amdNavVersionCheck("side", true);
  }
);

// Middleware ---------------------------------------------------------------------------------------
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json({ limit: "1mb" }));
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", devUrl || srvUrl || "mboulton.com");
  res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  next();
});
// Checks the request body for the password so that you can post to the database
app.use((req, res, next) => {
  req.body.auth = false;
  req.body.password === postPassword
    ? (req.body.auth = true)
    : (req.body.auth = false);
  next();
});

// Import Routes
const amdNavRoutes = require("./routes/amd/amdNavRoutes");
const amdContentRoutes = require("./routes/amd/amdContentRoutes");
const amdSpecRoutes = require("./routes/amd/amdSpecRoutes");

// Routes --------------------------------------------------------------------------------------------
app.use("/amd/nav", amdNavRoutes);
app.use("/amd/content", amdContentRoutes);
app.use("/amd/spec", amdSpecRoutes);
app.get("/", (req, res) => {
  res.json({ message: `this is the root api` });
});

// Port Listeners -----------------------------------------------------------------------------------
app.listen(port, (err) => {
  if (err) {
    return console.log("ERROR ", err);
  }
  console.log(`*** Listening on port ${port} ***`);
});
//
