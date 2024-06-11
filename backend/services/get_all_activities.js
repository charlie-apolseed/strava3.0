/*
Service class used to get all the activities from the stravaAPI. The module export is the async function that returns all the ride activity objects. 
*/

const getAccessToken = require("./get_access_token");

async function getAllActivities() {
    const accessToken = await getAccessToken();
    const myHeaders = new Headers();
    myHeaders.append("Authorization", `Bearer ${accessToken}`);
    myHeaders.append("Cookie", "_strava4_session=m2ff4v6hkor8bg2q44b9o3h0t48c5mc6");

    const requestOptions = {
        method: "GET",
        headers: myHeaders,
        redirect: "follow"
    };

    try {
        let allActivities = [];
        let page = 1;
        let responseData;

        do {
            const response = await fetch(`https://www.strava.com/api/v3/athlete/activities?page=${page}&per_page=200`, requestOptions);
            responseData = await response.json();

            if (!response.ok) {
                throw new Error(`Error fetching activities: ${responseData.message}`);
            }

            // Process the response from the Strava API.
            responseData.forEach(returnedActivity => {
                if (returnedActivity.type === "Ride") {
                    const processedActivity = {
                        title: returnedActivity.name,
                        date: returnedActivity.start_date_local,
                        duration: returnedActivity.moving_time,
                        distance: returnedActivity.distance, // Add distance
                        avgHeartRate: returnedActivity.average_heartrate,
                        maxHeartRate: returnedActivity.max_heartrate,
                        mapData: returnedActivity.map
                    };
                    allActivities.push(processedActivity);
                }
            });

            page++;
        } while (responseData.length > 0);

        return allActivities;
    } catch (error) {
        console.error("Failed to fetch activities from Strava:", error);
        throw error; // Rethrow the error to propagate it
    }
}

module.exports = getAllActivities; // Export the function itself