require('dotenv').config();
const mongoose = require('mongoose');
const ContentItem = require('./src/models/ContentItem');

async function fixCyberpunk() {
    await mongoose.connect(process.env.MONGO_URI);
    const items = await ContentItem.find({ title: 'Cyberpunk 2077' });
    
    if (items.length > 0) {
        const toKeep = items[0];
        if (items.length > 1) {
            console.log(`Found ${items.length} entries for Cyberpunk 2077. Consolidating...`);
            const idsToDelete = items.slice(1).map(i => i._id);
            await ContentItem.deleteMany({ _id: { $in: idsToDelete } });
        }
        toKeep.posterUrl = '/posters/cyberpunk-2077.png';
        toKeep.category = 'videogame';
        await toKeep.save();
        console.log('Cyberpunk 2077 consolidated and poster updated to .png');
    } else {
        console.log('Cyberpunk 2077 not found.');
    }
    process.exit();
}
fixCyberpunk();
