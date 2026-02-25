const axios = require('axios');
const fs = require('fs');
const path = require('path');

const TASKS = [
    {
        name: 'GTA VI',
        dest: path.join(__dirname, 'src/assets/posters/gta-vi.png'),
        urls: [
            // Rockstar (Official, might need cookies but trying again)
            'https://media-rockstargames-com.akamaized.net/tina-uploads/posts/4k5kk91475k2k4/850117ed5b81734f40447335ce5058c42b10a200.jpg',
             // Fandom Wiki (Very likely to work)
            'https://static.wikia.nocookie.net/gtawiki/images/e/e0/GTAVI-Logo.png',
            // IGN
            'https://assets-prd.ignimgs.com/2023/12/04/gta-6-button-1701730037803.jpg',
            // Generic fallback 
            'https://upload.wikimedia.org/wikipedia/commons/e/e1/Grand_Theft_Auto_VI_logo.png' 
        ]
    },
    {
        name: 'Avengers Doomsday',
        dest: path.join(__dirname, 'src/assets/posters/avengers-doomsday.jpg'),
        urls: [
            // Fan/News sites hosting the logo
             'https://images.thedirect.com/media/article_full/avengers-doomsday-poster.jpg',
             'https://static1.srcdn.com/wordpress/wp-content/uploads/2024/07/avengers-doomsday-logo-rdj.jpg',
             // Marvel Fandom
             'https://static.wikia.nocookie.net/marvelcinematicuniverse/images/a/aa/Avengers_Doomsday_Logo.png',
             // Another common one
             'https://cdn.mos.cms.futurecdn.net/h8X5X5y5y5y5y5y.jpg' // Placeholder
        ]
    }
];

async function downloadFile(url, dest) {
    try {
        console.log(`Trying ${url}...`);
        const response = await axios({
            url: url,
            method: 'GET',
            responseType: 'stream',
            headers: {
                // Mimic a browser to avoid some 403s
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Referer': 'https://www.google.com/'
            },
            timeout: 10000
        });
        const writer = fs.createWriteStream(dest);
        response.data.pipe(writer);
        await new Promise((resolve, reject) => {
            writer.on('finish', resolve);
            writer.on('error', reject);
        });
        console.log(`SUCCESS: Saved to ${dest}`);
        return true;
    } catch(e) {
        console.log(`Failed: ${e.message}`);
        try { fs.unlinkSync(dest); } catch(err) {} // cleanup
        return false;
    }
}

async function run() {
    for(const task of TASKS) {
        console.log(`\nProcessing ${task.name}...`);
        let success = false;
        for(const url of task.urls) {
            if(await downloadFile(url, task.dest)) {
                success = true;
                break;
            }
        }
        if(!success) console.error(`ALL FAILED for ${task.name}`);
    }
}

run();
