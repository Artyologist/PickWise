require('dotenv').config();
const mongoose = require('mongoose');
const ContentItem = require('./src/models/ContentItem');

(async () => {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/pickwise');
  const items = await ContentItem.find({ 'crossIp.0': { $exists: true } }).select('title crossIp');
  console.log('Cross-IP Links found:', items.length);
  items.forEach(i => {
    console.log(`- ${i.title}: ${i.crossIp.length} links`);
  });
  process.exit();
})();
