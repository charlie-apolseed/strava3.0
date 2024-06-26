const express = require('express');
const mongoose = require('./database/mongoose');


const app = express();

//Import the database model
const Ride = require('./database/models/ride');

//Allow the application to use json data
app.use(express.json());
app.listen(3000, () => console.log("Connected to server on port 3000"));


/*
CORS - Cross Origin Request Security.
localhost:3000 - backend api
localhost:4200 - front-end
*/

app.use((req, res, next) => {
    //allow any origin to access the API
    res.header("Access-Control-Allow-Origin", "*");
    //Allow the following methods to acccess the API
    res.header("Access-Control-Allow-Methods", "GET, POST, HEAD, OPTIONS, PUT, PATCH, DELETE");
    //Allow all the headers
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

/*
Rides: Read, Delete, Update 
*/

/*
Get all rides from database
*/
app.get('/rides', (req, res) => {
    Ride.find({})
        .then(rides => res.send(rides))
        .catch((err) => console.log(err))
});

/*
Add all rides to the database 
*/
app.post('/rides', async (req, res) => {
    const getAllActivities = require('./services/get_all_activities.js');
    const rides = await getAllActivities();
    rides.forEach(saveRide);
    function saveRide(value) {
        new Ride(value).save()
            .then(console.log(value.title + " was saved."))
            .catch((error) => res.send(error))
    }
    res.send("All rides were successfully uploaded to the database.")
})

/*
Add rides that are currently not uploaded to the database 
*/
app.post('/rides/update', async (req, res) => {
    const getSpecifiedActivities = require('./services/get_specified_activities.js');
    let duplicateDetected = false;
    let page = 1;
    while (!duplicateDetected) {
        try {
            const rides = await getSpecifiedActivities(page);
            for (const ride of rides) {
                const existingRide = await Ride.findOne(ride);
                if (!existingRide) {
                    await new Ride(ride).save();
                    console.log(ride.title + " was saved.");
                } else {
                    console.log(ride.title + " already exists in the database!");
                    duplicateDetected = true;
                    break; // Break out of the for loop
                }
            }
            page += 1;
        } catch (error) {
            res.status(500).send(error);
            break; // Exit the loop if there is an error
        }
    }
    res.send('Update process completed.');
});

/*
Get a ride with the given title and date.
*/
app.get('/rides/:title/:date', (req, res) => {
    Ride.find({ title: req.params.title, date: req.params.date })
        .then((ride) => res.send(ride))
        .catch((error) => console.log(error))
});


/*
Update a ride 
*/
app.patch('/rides/:title/:date', (req, res) => {
    Ride.findOneAndUpdate({ title: req.params.title, date: req.params.date }, {
        title: req.body.title,
        date: req.body.date,
        duration: req.body.duration,
        distance: req.body.distance,
        avgHearRate: req.body.avgHeartRate,
        maxHeartRate: req.body.maxHeartRate,
        mapData: req.body.mapData
    }, { new: true })
        .then((ride) => res.send(ride))
        .catch((error) => console.log(error));
})

/*
Delete a ride
*/
app.delete('/rides/:title/:date', (req, res) => {
    Ride.findOneAndDelete({ title: req.params.title, date: req.params.date })
        .then((ride) => res.send(ride))
        .catch((error) => console.log(error));
})
