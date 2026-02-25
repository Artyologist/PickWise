const mongoose = require('mongoose');
const ContentItem = require('./src/models/ContentItem');
require('dotenv').config();

async function check() {
  await mongoose.connect(process.env.MONGO_URI);
  const count = await ContentItem.countDocuments();
  console.log('Total items in DB:', count);
  const comedyCount = await ContentItem.countDocuments({ genres: 'Comedy' });
  console.log('Comedy items in DB:', comedyCount);
  process.exit(0);
}
check();
