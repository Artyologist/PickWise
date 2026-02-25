require('dotenv').config();
const mongoose = require('mongoose');
const ContentItem = require('./src/models/ContentItem');

async function fixGames() {
    await mongoose.connect(process.env.MONGO_URI);
    
    const gamesFranchises = [
        { name: "Spider-Man Games", query: { title: /Marvel's Spider-Man/i, category: "videogame" } },
        { name: "Star Wars Jedi", query: { title: /Star Wars Jedi/i, category: "videogame" } }
    ];

    const linkFranchise = async (items) => {
        items.sort((a, b) => parseInt(a.year) - parseInt(b.year));
        for (let i = 0; i < items.length; i++) {
            const current = items[i];
            for (let j = 0; j < i; j++) {
                if (!current.crossIp.some(r => r.targetId.equals(items[j]._id))) {
                    current.crossIp.push({ targetId: items[j]._id, relationType: 'prequel' });
                }
            }
            for (let j = i + 1; j < items.length; j++) {
                if (!current.crossIp.some(r => r.targetId.equals(items[j]._id))) {
                    current.crossIp.push({ targetId: items[j]._id, relationType: 'sequel' });
                }
            }
            await current.save();
        }
    };

    for (const f of gamesFranchises) {
        const items = await ContentItem.find(f.query);
        console.log(`Linking ${f.name}`);
        await linkFranchise(items);
    }
    
    console.log("Game franchises linked.");
    process.exit();
}
fixGames();
