const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const queryCourses = new Schema({
    id: String,
    title: String,
    description: String,
    reviews: Array
});

module.exports = mongoose.model("querycourses", queryCourses);