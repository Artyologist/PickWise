const mongoose = require('mongoose');
const ContentItem = require('./src/models/ContentItem');
const { fetchRAWGDetails } = require('./src/services/rawg.service');
require('dotenv').config();

const MONGO = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/pickwise';
const TARGET_ID = '69760af01e4107171460e485'; // The ID the user is looking at

async function run() {
  try {
    await mongoose.connect(MONGO);
    console.log(`Checking Content: ${TARGET_ID}`);
    
    // 1. Find the item
    // Note: The ID provided by user might be the Mongo _id.
    // If it's invalid, it will throw, so we handle that.
    if (!mongoose.Types.ObjectId.isValid(TARGET_ID)) {
        console.error("Invalid ObjectId Format");
        process.exit(1);
    }

    const item = await ContentItem.findById(TARGET_ID);
    if (!item) {
        console.error("Content not found in DB");
        process.exit(1);
    }

    console.log(`Found: ${item.title} | Source: ${item.source} | ExtID: ${item.externalId}`);

    // 2. Fetch Live Details
    if (item.source === 'rawg') {
        console.log("Fetching RAWG Data...");
        const details = await fetchRAWGDetails(item.externalId);
        if (!details) {
            console.error("RAWG Service returned null");
        } else {
            console.log("RAWG Data Fetched!");
            console.log("DLCs:", details.dlcs?.length);
            console.log("Screenshots:", details.screenshots?.length);
            console.log("Stores:", details.stores?.length);
            // console.log("Full:", JSON.stringify(details, null, 2));
        }
    } else {
        console.log(`Not a RAWG item (Source: ${item.source}). Skipping RAWG test.`);
    }

    process.exit(0);

  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

run();
