const express = require("express");
const router = express.Router();
const {
  amdSpecItemModel,
  amdSpecListModel,
} = require("../../database/mongodbAmd");
const { auth } = require("../../functions/amd/amdFunctions");

// Routing for amd spec data ------------------------------------------------- Spec Routing

router
  .route("/")

  .get(async (req, res) => {
    let reqSchema = null;
    try {
      if (req.query.location == null || req.query.target == null) {
        return res.json({
          message: "Error",
          error: `Queries missing for location : ${req.query.location} or Target ${req.query.location}`,
        });
      }
      // declaring the schema based on location query
      if (req.query.location == "list") {
        reqSchema = amdSpecListModel;
      }
      if (req.query.location == "item") {
        reqSchema = amdSpecItemModel;
      }
      let get = await reqSchema.findOne({ target: req.query.target });
      if (get == null) {
        return res.json({
          message: "Empty",
          error: "Item does not exist on the database",
        });
      }
      res.json({
        message: "Data",
        data: get,
      });
      console.log(`Data requested for the amdDB spec -- ${get.target}`, Date());
    } catch (err) {
      res.json({
        message: "error",
        error: "There was an error getting amdDB spec",
        errorData: err,
      });
    }
  })

  // posts made to amd spec database

  .post(auth, async (req, res) => {
    let post = null;
    let response = null;
    if (req.query.location == "list") {
      post = new amdSpecListModel({
        target: req.body.payload.target,
        insertId: req.body.payload.insertId,
        models: req.body.payload.models,
      });
      response = "List Saved";
    }
    if (req.query.location == "item") {
      post = new amdSpecItemModel({
        target: req.body.payload.target,
        insertId: req.body.payload.insertId,
        items: req.body.payload.items,
      });
      response = "Item Saved";
    }
    if (req.query.location == null) {
      response = "Location query not Declared";
    }
    try {
      if (post == null) {
        res.json(response);
        return console.log("Failed attempt to save to Amd Specs");
      }
      await post.save();
      res.json(response);
    } catch (err) {
      res.json({
        type: "There was an error posting amd spec's",
        message: err,
      });
    }
  })

  // updates to amd spec data on database

  .put(auth, async (req, res) => {
    let putObj = null;
    let reqSchema = null;
    if (req.query.location == "list") {
      reqSchema = amdSpecListModel;
      putObj = {
        target: req.body.payload.target,
        insertId: req.body.payload.insertId,
        models: req.body.payload.models,
      };
    }
    if (req.query.location == "item") {
      reqSchema = amdSpecItemModel;
      putObj = {
        target: req.body.payload.target,
        insertId: req.body.payload.insertId,
        items: req.body.payload.items,
      };
    }
    try {
      await reqSchema.updateOne({ target: req.query.target }, putObj);
      res.json(
        `Updated data to ${req.query.target} in the amd spec ${req.query.location}`
      );
      console.log(`Updated posts to amdDB spec with ${req.query.target}`);
    } catch (err) {
      res.json({
        type: "There was an error putting amd spec's",
        message: err,
      });
      console.log(err);
    }
  });

module.exports = router;
