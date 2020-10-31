const mongoose = require('mongoose');

// Enterprise model.
let Enterprise = require('../models/enterprise');

const Schema = mongoose.Schema;

// Define collection and schema.
let Store = new Schema({
    enterprise: {
        type: Schema.Types.ObjectId,
        ref: Enterprise,
        required: true
    },
    type: {
        type: String,
        enum: ['TREE', 'PREPARATION']
    },
    name: {
        type: String,
        required: true
    },
    manufacturer: {
        type: String,
        required: true
    },
    quantity: {
        type: Number,
        min: 0,
        required: true,
        default: 1
    },
    days: {
        type: Number,
        min: 0,
        required: true
    },
    price: {
        type: Number,
        min: 1,
        required: true
    },
    reviews: {
        type: Number,
        min: 0,
        max: 5
    }
})

module.exports = mongoose.model('Store', Store)