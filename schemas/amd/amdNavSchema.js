const mongoose = require("mongoose");
const { Schema } = mongoose;

const reqString = {
  type: String,
  required: true,
};
const AmdNav = new Schema(
  {
    target: reqString,
    insertId: reqString,
    content: Object,
    version: Number,
  },
  { timestamps: true }
);
module.exports = AmdNav;