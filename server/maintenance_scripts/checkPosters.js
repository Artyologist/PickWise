require('dotenv').config();
const mongoose = require('mongoose');
const ContentItem = require('./src/models/ContentItem');

const MONGO = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/pickwise';

(async () => {
  try {
    await mongoose.connect(MONGO);
    const total = await ContentItem.countDocuments();
    const missing = await ContentItem.countDocuments({ 
      $or: [
        { posterUrl: { $exists: false } }, 
        { posterUrl: "" }, 
        { posterUrl: null }
      ] 
    });
    
    // Also check for URLs that aren't http/https (might be broken)
    const invalid = await ContentItem.countDocuments({
      posterUrl: { $regex: /^(?!http|\/).+/, $options: 'i' }
    });

    console.log(`Total Items: ${total}`);
    console.log(`Missing Posters: ${missing}`);
    console.log(`Invalid Posters (Suspicious format): ${invalid}`);

    const sampleMissing = await ContentItem.find({ 
      $or: [
        { posterUrl: { $exists: false } }, 
        { posterUrl: "" }, 
        { posterUrl: null }
      ] 
    }).limit(5).select('title category');

    console.log('\nSample items needing posters:');
    sampleMissing.forEach(i => console.log(`- ${i.title} (${i.category})`));

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
