const express = require("express");
const router = express.Router();
const AmdNav = require("../../models/amd/amdModelNav");
const {
  amdNavVersionCheck,
  amdNavVersionUpdate,
} = require("../../functions/amd/amdFunctions");

// Check for authentication
const auth = (req, res, next) => {
  if (req.body.auth) {
    next();
  } else {
    console.log(
      `Posting priveleges have been denied by ${JSON.stringify(
        req.headers.host
      )}`
    );
    res.json({ message: "Incorrect Password" });
  }
};

// Routing for amd nav data -------------------------------------------------- Nav Routing

router
  .route("/")

  // get request for amd nav data

  .get(async (req, res) => {
    try {
      const get = await AmdNav.find({ primary: true });
      res.json(get);
      console.log("data requested for the amdDB Nav");
    } catch (err) {
      res.json({ message: "there was an error getting amd nav", error: err });
    }
  })

  // posts made to amd nav database

  .post(auth, async (req, res) => {
    const post = new AmdNav({
      primary: req.body.payload.primary,
      navList: req.body.payload.navList,
      version: req.body.payload.version,
    });
    try {
      const savedPost = await post.save();
      res.json(savedPost);
      console.log("posted to Amd nav on the database");
    } catch (err) {
      res.json({
        type: "Error posting to the Database",
        message: err,
      });
    }
  })

  // updates to amd nav data on database

  .put(auth, async (req, res) => {
    // checking current version
    let versionCurrent = await amdNavVersionCheck();
    let versionUpdate = await amdNavVersionUpdate();
    // Building the updated changes
    const put = {
      primary: req.body.payload.primary,
      navList: req.body.payload.navList,
      version: versionUpdate,
    };
    try {
      await AmdNav.updateOne({ primary: true }, put);
      // responding to the client and logging the updated
      res.json(put);
      console.log(`Updated Amd nav on the database to version: ${put.version}`);
    } catch (err) {
      res.json({
        type: "Error posting to the Database",
        message: err,
      });
      console.log(err);
    }
  });

module.exports = router;
