const mongoose = require('mongoose');
const ContentItem = require('./src/models/ContentItem');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/pickwise";

const runDiagnostics = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('--- 🛡️ Intelligence Integrity Report ---');

        const total = await ContentItem.countDocuments();
        const missingPosters = await ContentItem.countDocuments({ 
            $or: [
                { posterUrl: { $exists: false } },
                { posterUrl: "" },
                { posterUrl: "/placeholder-poster.png" }
            ] 
        });
        const missingDescription = await ContentItem.countDocuments({ 
            $or: [
                { description: { $exists: false } },
                { description: "" }
            ] 
        });
        const missingGenres = await ContentItem.countDocuments({ 
            genres: { $size: 0 } 
        });

        console.log(`Total Records: ${total}`);
        console.log(`Missing Posters: ${missingPosters}`);
        console.log(`Missing Descriptions: ${missingDescription}`);
        console.log(`Empty Genre Spectra: ${missingGenres}`);

        if (total > 0) {
            console.log('\n--- ⚠️ Identified Volatile Entries (Sample) ---');
            const volatile = await ContentItem.find({
                $or: [
                    { posterUrl: "/placeholder-poster.png" },
                    { description: "" }
                ]
            }).limit(5).select('title category source');
            
            volatile.forEach(v => {
                console.log(`[!] ${v.title} (${v.category}) - Source: ${v.source}`);
            });
        }

        console.log('\n--- ✅ Integrity Check Complete ---');
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
};

runDiagnostics();
