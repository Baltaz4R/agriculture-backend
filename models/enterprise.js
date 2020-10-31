const mongoose = require('mongoose');


const Schema = mongoose.Schema;

// Define collection and schema.
let Enterprise = new Schema({
    name: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    place: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    }
})

module.exports = mongoose.model('Enterprise', Enterprise)