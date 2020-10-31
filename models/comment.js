const mongoose = require('mongoose');

// Store model.
let Store = require('../models/store');
// Agriculturist model.
let Agriculturist = require('../models/agriculturist');

const Schema = mongoose.Schema;

// Define collection and schema.
let Comment = new Schema({
    agriculturist: {
        type: Schema.Types.ObjectId,
        ref: Agriculturist,
        required: true
    },
    product: {
        type: Schema.Types.ObjectId,
        ref: Store,
        required: true
    },
    reviews: {
        type: Number,
        min: 0,
        max: 5
    },
    text: {
        type: String,
        default: '',
        required: true
    }
})

module.exports = mongoose.model('Comment', Comment)