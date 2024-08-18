const mongoose = require('mongoose');

//Create a schema
const GoalSchema = new mongoose.Schema({
    title: {
        type: String,
        trim: true,
        minLength: 0
    },
    startDate: {
        type: String,
    },
    targetDate: {
        type: Number
    },
    startValue: {
        type: Number
    },
    targetValue: {
        type: Number
    },
    metric: {
        type: String
    }
})

//Create the model
const Goal = mongoose.model('Goal', GoalSchema);

module.exports = Goal;