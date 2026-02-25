const mongoose = require('mongoose');
const ContentItem = require('./src/models/ContentItem');
const { fetchRAWGDetails } = require('./src/services/rawg.service');
require('dotenv').config();

const MONGO = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/pickwise';
const TARGET_ID = '69760af01e4107171460e485'; 

async function run() {
  console.log("Rawg Key Present:", !!process.env.RAWG_KEY);
  console.log("Details Fetching:", TARGET_ID);

  try {
    await mongoose.connect(MONGO);
    
    const item = await ContentItem.findById(TARGET_ID);
    if (!item) { console.log('Item not found'); process.exit(1); }
    
    console.log(`FETCHING: ${item.externalId} (${item.source})`);

    const details = await fetchRAWGDetails(item.externalId);
    if (!details) {
        console.log("RESULT: NULL (Check server logs for error)");
    } else {
        console.log("RESULT: SUCCESS");
        console.log("DLCs:", details.dlcs?.length);
    }
  } catch(e) { console.error(e); }
  
  process.exit(0);
}
run();
