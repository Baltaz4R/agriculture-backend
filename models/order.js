const mongoose = require('mongoose');

// Store model.
let Store = require('../models/store');
// Garden model.
let Garden = require('../models/garden');
// Agriculturist model.
let Agriculturist = require('../models/agriculturist');
// Enterprise model.
let Enterprise = require('../models/enterprise');

const Schema = mongoose.Schema;

// Define collection and schema.
let Order = new Schema({
    enterprise: {
        type: Schema.Types.ObjectId,
        ref: Enterprise,
        required: true
    },
    garden: {
        type: Schema.Types.ObjectId,
        ref: Garden,
        required: true
    },
    product: {
        type: Schema.Types.ObjectId,
        ref: Store,
        required: true
    },
    quantity: {
        type: Number,
        min: 0,
        required: true,
        default: 1
    },
    date: {
        type: Date,
        required: true,
        default: Date.now
    },
    status: {
        type: String,
        default: null
    }
})

module.exports = mongoose.model('Order', Order)