const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ReviewSchema = new Schema({
  id: String,
  content: String,
  courseId: String,
});

module.exports = mongoose.model("reviews", ReviewSchema);