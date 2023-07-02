const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const coursesSchema = new Schema({
    id: String,
    title: String,
    description: String
});

module.exports = mongoose.model("courses", coursesSchema);