const mongoose = require('mongoose');


const Schema = mongoose.Schema;

// Define collection and schema.
let Admin = new Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    }
})

module.exports = mongoose.model('Admin', Admin)