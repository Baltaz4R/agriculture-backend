const mongoose = require('mongoose');

// Agriculturist model.
let Agriculturist = require('../models/agriculturist');


const Schema = mongoose.Schema;

// Define collection and schema.
let Garden = new Schema({
    agriculturist: {
        type: Schema.Types.ObjectId,
        ref: Agriculturist,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    place: {
        type: String,
        required: true
    },
    width: {
        type: Number,
        min: 0,
        required: true
    },
    height: {
        type: Number,
        min: 0,
        required: true
    },
    positions: {
        type: [[{
            name: {
                type: String,
                required: true
            },
            manufacturer: {
                type: String,
                required: true
            },
            progress: {
                type: Number,
                min: 0,
                required: true,
                default: 0
            },
            days: {
                type: Number,
                min: 0,
                required: true
            },
        }]],
        required: true
    },
    numberOfTrees: {
        type: Number,
        min: 0,
        required: true,
        default: 0
    },
    numberOfFreeSpace: {
        type: Number,
        min: 0,
        required: true,
        default: 0
    },
    tank: {
        type: Number,
        min: 0,
        required: true,
        default: 200
    },
    temperature: {
        type: Number,
        min: 0,
        required: true,
        default: 18
    },
    warehouse: {
        type: [{
            _id: {
                type: Schema.Types.ObjectId,
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
            status: {
                type: Schema.Types.ObjectId,
                required: true,
                default: null
            }
        }],
        required: true,
        default: []
    }
})

module.exports = mongoose.model('Garden', Garden)