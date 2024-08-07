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
Get the specified number of most recent rides
*/
app.get('/rides/:num', async (req, res) => {
    try {
      // Extract the number of rides to fetch from the request parameters
      const num = parseInt(req.params.num, 10);
  
      if (isNaN(num) || num <= 0) {
        return res.status(400).json({ error: 'Invalid number of rides requested' });
      }
  
      // Fetch the most recent rides, sorted by a date field (e.g., createdAt) in descending order
      const rides = await Ride.find().sort({ date: -1 }).limit(num);
  
      // Send the fetched rides as a JSON response
      res.json(rides);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'An error occurred while fetching rides' });
    }
});

/*
Get the specified number of longest rides
*/
app.get('/rides/distance/:num', async (req, res) => {
    try {
      // Extract the number of rides to fetch from the request parameters
      const num = parseInt(req.params.num, 10);
  
      if (isNaN(num) || num <= 0) {
        return res.status(400).json({ error: 'Invalid number of rides requested' });
      }
  
      // Fetch the most recent rides, sorted by a date field (e.g., createdAt) in descending order
      const rides = await Ride.find().sort({ distance: -1 }).limit(num);
  
      // Send the fetched rides as a JSON response
      res.json(rides);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'An error occurred while fetching rides' });
    }
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

app.post('/rides/update', async (req, res) => {
    const getSpecifiedActivities = require('./services/get_specified_activities.js');
    let duplicateDetected = false;
    let page = 1;

    try {
        while (!duplicateDetected) {
            const rides = await getSpecifiedActivities(page);
            if (rides.length === 0) break; // Break loop if no more activities

            for (const ride of rides) {
                const existingRide = await Ride.findOne({ title: ride.title, date: ride.date });
                if (!existingRide) {
                    await new Ride(ride).save();
                    console.log(`${ride.title} was saved.`);
                } else {
                    console.log(`${ride.title} already exists in the database!`);
                    duplicateDetected = true;
                    break; // Break out of the for loop
                }
            }
            page += 1;
        }
        res.send('Update process completed.');
    } catch (error) {
        console.error('Error updating rides:', error);
        if (!res.headersSent) {
            res.status(500).send('An error occurred during the update process.');
        }
    }
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
app.patch('/rides/notes/:title/:date', (req, res) => {
    Ride.findOneAndUpdate({ title: req.params.title, date: req.params.date }, {
        notes: req.body.notes
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
