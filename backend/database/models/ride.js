const mongoose = require('mongoose');

//Create a schema
const RideSchema = new mongoose.Schema({
    title: {
        type: String,
        trim: true,
        minLength: 0
    },
    date: {
        type: String,
        required: true
    },
    duration: {
        type: Number
    },
    distance: {
        type: Number
    },
    avgHeartRate: {
        type: Number
    },
    maxHeartRate: {
        type: Number
    },
    mapData: {
        type: Object
    }
} )

//Create the model
const Ride = mongoose.model('Ride', RideSchema);

module.exports = Ride;