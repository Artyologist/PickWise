require('dotenv').config();
const mongoose = require('mongoose');
const ContentItem = require('./src/models/ContentItem');

async function check() {
  await mongoose.connect(process.env.MONGO_URI);
  const items = await ContentItem.find({ 
    $or: [
        { title: /Star Wars/i },
        { title: /Iron Man/i },
        { title: /Spider/i },
        { title: /Avengers/i }
    ] 
  });
  console.log(items.map(i => `${i.category}: ${i.title}`).join('\n'));
  process.exit();
}
check();
