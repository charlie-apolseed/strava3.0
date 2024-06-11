/**
 * Helper function to get the accessToken using the refreshToken.
 * @returns the current accessToken.
 */
async function getAccessToken() {
    const myHeaders = new Headers();
    myHeaders.append("Cookie", "_strava4_session=m2ff4v6hkor8bg2q44b9o3h0t48c5mc6");

    const requestOptions = {
        method: "POST",
        headers: myHeaders,
        redirect: "follow"
    };

    try {
        const response = await fetch("https://www.strava.com/oauth/token?client_id=123837&client_secret=73c6f6d6578077e976d77d5f3daf477a2326b2ff&refresh_token=c17398f83e1e22da3c958c140a0edfff47d7d1a7&grant_type=refresh_token", requestOptions);
        const result = await response.json();
        const accessToken = result.access_token;
        return accessToken;
    } catch (error) {
        console.error(error);
        throw error; // Rethrow the error to propagate it
    }
}


module.exports = getAccessToken;