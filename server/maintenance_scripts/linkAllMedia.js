require('dotenv').config();
const mongoose = require('mongoose');
const ContentItem = require('./src/models/ContentItem');

async function linkMedia() {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    const mediaLinker = async (mainQuery, mediaQuery) => {
        const mainItems = await ContentItem.find(mainQuery);
        const mediaItems = await ContentItem.find(mediaQuery);
        
        for (const main of mainItems) {
            for (const media of mediaItems) {
                if (!main.crossIp.some(r => r.targetId.equals(media._id))) {
                    main.crossIp.push({ targetId: media._id, relationType: 'other_media' });
                }
                if (!media.crossIp.some(r => r.targetId.equals(main._id))) {
                    media.crossIp.push({ targetId: main._id, relationType: 'other_media' });
                }
            }
            await main.save();
        }
        for (const media of mediaItems) {
            await media.save();
        }
    };

    // HP Documentary
    await mediaLinker({ title: /Harry Potter/i, category: 'movie' }, { title: /Return to Hogwarts/i });
    
    // HP Games
    await mediaLinker({ title: /Harry Potter/i, category: 'movie' }, { title: /Hogwarts Legacy/i, category: 'videogame' });

    // Spider-Man Games
    await mediaLinker({ title: /Spider-Man/i, category: 'movie' }, { title: /Marvel's Spider-Man/i, category: 'videogame' });

    // Star Wars Games
    await mediaLinker({ title: /Star Wars/i, category: 'movie' }, { title: /Star Wars Jedi/i, category: 'videogame' });

    console.log("Media linking completed.");
    process.exit();
}

linkMedia();
