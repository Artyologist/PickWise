const mongoose = require('mongoose');
const UpcomingProject = require('./src/models/UpcomingProject');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/pickwise";

const connectDB = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('MongoDB connected');
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

const run = async () => {
    await connectDB();
    
    // Update Avengers with a reliable URL (Marvel official or wiki)
    // The previous wikimedia link was 404.
    // Try a different source.
    const avengers = await UpcomingProject.findOne({ slug: 'avengers:-doomsday' });
    if(avengers) {
        // Using a general placeholder or finding a live one?
        // Let's use the one from Fandom if possible, or The Direct.
        // Use the local file which is known to exist in public/posters
        avengers.posterUrl = '/posters/avengers-doomsday.webp';
        await avengers.save();
        console.log('Updated Avengers poster URL');
    }

    process.exit(0);
};

run();
