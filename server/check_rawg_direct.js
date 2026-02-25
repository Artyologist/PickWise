const axios = require('axios');
const KEY = '17082b5fdfd443d689390da26b0663a0';
const ID = 'elden-ring';

async function test() {
    try {
        console.log("Fetching...");
        const res = await axios.get(`https://api.rawg.io/api/games/${ID}?key=${KEY}`);
        console.log("Status:", res.status);
        console.log("Name:", res.data.name);
    } catch(e) {
        console.error("Error:", e.message);
        if(e.response) {
            console.error("Response Status:", e.response.status);
            console.error("Response Data:", JSON.stringify(e.response.data));
        }
    }
}
test();
