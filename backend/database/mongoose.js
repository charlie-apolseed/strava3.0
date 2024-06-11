const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

//Connect to the data base
mongoose.connect('mongodb://127.0.0.1:27017/strava_visualizer')
    .then(() => console.log('Database Connected'))
    .catch((error) => console.log(error));

module.exports = mongoose;