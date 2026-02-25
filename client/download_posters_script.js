const axios = require('axios');
const fs = require('fs');
const path = require('path');

const downloads = [
  {
    url: 'https://upload.wikimedia.org/wikipedia/en/d/d0/Grand_Theft_Auto_VI.png',
    dest: path.join(__dirname, 'src/assets/posters/gta-vi.png')
  },
  {
    // Alternate reliable source for Avengers if wiki fails
    url: 'https://upload.wikimedia.org/wikipedia/en/2/23/Avengers_Doomsday_poster.jpg', 
    dest: path.join(__dirname, 'src/assets/posters/avengers-doomsday.jpg')
  }
];

async function download() {
    for(const item of downloads) {
        try {
            console.log(`Downloading ${item.url}...`);
            const response = await axios({
                url: item.url,
                method: 'GET',
                responseType: 'stream',
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                }
            });
            const writer = fs.createWriteStream(item.dest);
            response.data.pipe(writer);
            await new Promise((resolve, reject) => {
                writer.on('finish', resolve);
                writer.on('error', reject);
            });
            console.log(`Saved to ${item.dest}`);
        } catch(e) {
            console.error(`Failed to download ${item.url}: ${e.message}`);
             // Backup for Avengers specifically
             if(item.dest.includes('avengers')) {
                 try {
                     const backupUrl = 'https://lumiere-a.akamaihd.net/v1/images/avengers_doomsday_logo_43743c3d.jpeg'; 
                     console.log(`Trying backup: ${backupUrl}`);
                     const res2 = await axios({
                        url: backupUrl,
                        method: 'GET',
                        responseType: 'stream',
                        headers: { 'User-Agent': 'Mozilla/5.0' }
                     });
                     const w2 = fs.createWriteStream(item.dest);
                     res2.data.pipe(w2);
                     await new Promise((resolve, reject) => {
                        w2.on('finish', resolve);
                        w2.on('error', reject);
                    });
                    console.log(`Saved backup to ${item.dest}`);
                 } catch(e2) {
                     console.error("Backup failed too", e2.message);
                 }
             }
        }
    }
}
download();
