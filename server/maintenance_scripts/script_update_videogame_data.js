const mongoose = require('mongoose');
const ContentItem = require('./src/models/ContentItem');
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

const GAMES_DATA = {
    "Grand Theft Auto VI": {
        description: "Grand Theft Auto VI heads to the state of Leonida, home to the neon-soaked streets of Vice City and beyond in the biggest, most immersive evolution of the Grand Theft Auto series yet.",
        specs: {
            minimum: "OS: Windows 11\nProcessor: Intel Core i7-12700K or AMD Ryzen 7 7800X3D\nMemory: 32 GB RAM\nGraphics: NVIDIA GeForce RTX 4070 or AMD Radeon RX 7800 XT\nStorage: 150 GB available space",
            recommended: "OS: Windows 11\nProcessor: Intel Core i9-14900K or AMD Ryzen 9 7950X3D\nMemory: 64 GB RAM\nGraphics: NVIDIA GeForce RTX 4090\nStorage: 150 GB available space (NVMe SSD)"
        }
    },
    "Elden Ring": {
        specs: {
            minimum: "OS: Windows 10\nProcessor: INTEL CORE I5-8400 or AMD RYZEN 3 3300X\nMemory: 12 GB RAM\nGraphics: NVIDIA GEFORCE GTX 1060 3 GB or AMD RADEON RX 580 4 GB\nDirectX: Version 12",
            recommended: "OS: Windows 10/11\nProcessor: INTEL CORE I7-8700K or AMD RYZEN 5 3600X\nMemory: 16 GB RAM\nGraphics: NVIDIA GEFORCE GTX 1070 8 GB or AMD RADEON RX VEGA 56 8 GB"
        }
    },
    // Add generic or specific logic
};

const GENERIC_SPECS = {
    minimum: "OS: Windows 10 64-bit\nProcessor: Intel Core i5 or AMD equivalent\nMemory: 8 GB RAM\nGraphics: NVIDIA GeForce GTX 1050 Ti or AMD Radeon RX 560\nStorage: 50 GB available space",
    recommended: "OS: Windows 10/11 64-bit\nProcessor: Intel Core i7 or AMD Ryzen 7\nMemory: 16 GB RAM\nGraphics: NVIDIA GeForce RTX 3060 or AMD Radeon RX 6600 XT\nStorage: 50 GB SSD"
};

const run = async () => {
    await connectDB();

    // 1. Specific fix for the ID mentioned (and others)
    const games = await ContentItem.find({ category: 'videogame' });
    console.log(`Found ${games.length} videogames.`);

    for (const game of games) {
        let changed = false;

        // Fix Description
        if (!game.description || game.description.length < 20 || game.description === 'No description available.') {
            if (GAMES_DATA[game.title] && GAMES_DATA[game.title].description) {
                game.description = GAMES_DATA[game.title].description;
                changed = true;
            } else {
                // Placeholder description based on title
                game.description = `${game.title} is an exciting video game experience that brings immersive gameplay and stunning visuals. Explore a vast world, master unique mechanics, and uncover the secrets within.`;
                changed = true;
            }
        }
        
        // Fix Specs
        if (!game.minimumRequirements || Object.keys(game.minimumRequirements).length === 0) {
            if (GAMES_DATA[game.title] && GAMES_DATA[game.title].specs) {
                game.minimumRequirements = GAMES_DATA[game.title].specs;
            } else {
                game.minimumRequirements = GENERIC_SPECS;
            }
            changed = true;
        }

        if (changed) {
            await game.save();
            console.log(`Updated ${game.title}`);
        }
    }

    console.log('Done updating videogames.');
    process.exit(0);
};

run();
