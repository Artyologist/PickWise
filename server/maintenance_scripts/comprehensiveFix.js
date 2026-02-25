require('dotenv').config();
const mongoose = require('mongoose');
const ContentItem = require('./src/models/ContentItem');

async function comprehensiveFix() {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    const franchiseItems = [
        // STAR WARS
        { title: "Star Wars: Episode I - The Phantom Menace", category: "movie", year: "1999", posterUrl: "/posters/star-wars-episode-i-phantom-menace.webp" },
        { title: "Star Wars: Episode II - Attack of the Clones", category: "movie", year: "2002", posterUrl: "/posters/star-wars-episode-ii-attack-of-clones.webp" },
        { title: "Star Wars: Episode III - Revenge of the Sith", category: "movie", year: "2005", posterUrl: "/posters/star-wars-episode-iii-revenge-of-the-sith.webp" },
        { title: "Star Wars: Episode IV - A New Hope", category: "movie", year: "1977", posterUrl: "/posters/star-wars-episode-iv-a-new-hope.webp" },
        { title: "Star Wars: Episode V - The Empire Strikes Back", category: "movie", year: "1980", posterUrl: "/posters/star-wars-episode-v-the-empire-strikes-back.webp" },
        { title: "Star Wars: Episode VI - Return of the Jedi", category: "movie", year: "1983", posterUrl: "/posters/star-wars-episode-vi-return-of-the-jedi.webp" },
        { title: "Star Wars: The Force Awakens", category: "movie", year: "2015", posterUrl: "/posters/star-wars-vii-the-force-awakens.jpg" },
        { title: "Star Wars: The Last Jedi", category: "movie", year: "2017", posterUrl: "/posters/star-wars-viii-the-last-jedi.jpg" },
        { title: "Star Wars: The Rise of Skywalker", category: "movie", year: "2019", posterUrl: "/posters/star-wars-ix-the-rise-of-skywalker.jpg" },

        // SPIDER-MAN (Sam Raimi)
        { title: "Spider-Man", category: "movie", year: "2002", posterUrl: "/posters/the-amazing-spider-man.jpg" }, // Closest match in provided files
        { title: "Spider-Man 2", category: "movie", year: "2004", posterUrl: "/posters/the-amazing-spider-man.jpg" },
        
        // AMAZING SPIDER-MAN
        { title: "The Amazing Spider-Man", category: "movie", year: "2012", posterUrl: "/posters/the-amazing-spider-man.jpg" },
        { title: "The Amazing Spider-Man 2", category: "movie", year: "2014", posterUrl: "/posters/the-amazing-spider-man.jpg" },

        // GAMES
        { title: "Marvel's Spider-Man Remastered", category: "videogame", year: "2018", posterUrl: "/posters/marvels-spider-man-remastered.jpg" },
        { title: "Marvel's Spider-Man: Miles Morales", category: "videogame", year: "2020", posterUrl: "/posters/marvels-spider-man-miles-morales.jpg" },
        { title: "Marvel's Spider-Man 2", category: "videogame", year: "2023", posterUrl: "/posters/marvels-spider-man-2.jpg" },
        { title: "Star Wars Jedi: Fallen Order", category: "videogame", year: "2019", posterUrl: "/posters/star-wars-jedi-fallen-order.jpg" },
        { title: "Star Wars Jedi: Survivor", category: "videogame", year: "2023", posterUrl: "/posters/star-wars-jedi-survivor.jpg" },
        { title: "Hogwarts Legacy", category: "videogame", year: "2023", posterUrl: "/posters/hogwarts-legacy.webp" },
        { title: "Elden Ring", category: "videogame", year: "2022", posterUrl: "/posters/elden-ring.jpg" },
        { title: "Cyberpunk 2077", category: "videogame", year: "2020", posterUrl: "/posters/cyberpunk-2077.png" }
    ];

    for (const item of franchiseItems) {
        const query = { title: item.title, category: item.category };
        const exists = await ContentItem.findOne(query);
        if (!exists) {
            await ContentItem.create(item);
            console.log(`Created: ${item.title}`);
        } else {
            exists.posterUrl = item.posterUrl;
            await exists.save();
            console.log(`Updated: ${item.title}`);
        }
    }

    // Now Link all "Sequels" and "Prequels" to ALL other items in the series
    // Logic: If in the same category (e.g. Movie) and chronological (by year), add all previous as prequels and all future as sequels.

    const franchises = [
        { name: "HP Movies", query: { title: /Harry Potter/i, category: "movie" }, order: "index" }, // HP has custom indexing due to Part 1/2
        { name: "HP Novels", query: { title: /Harry Potter/i, category: "novel" } },
        { name: "Star Wars Movies", query: { title: /Star Wars/i, category: "movie" } },
        { name: "Iron Man Movies", query: { title: /Iron Man/i, category: "movie" } },
        { name: "Spider-Man MCU", query: { title: /Spider-Man: (Homecoming|Far From Home|No Way Home)/i, category: "movie" } },
        { name: "Avengers Movies", query: { title: /Avengers/i, category: "movie" } }
    ];

    // Helper to clear and link
    const linkFranchise = async (items) => {
        // Sort by year
        items.sort((a, b) => parseInt(a.year) - parseInt(b.year));
        
        for (let i = 0; i < items.length; i++) {
            const current = items[i];
            current.crossIp = current.crossIp.filter(r => r.relationType === 'spinoff' || r.relationType === 'novel' || r.relationType === 'adaptation'); // Keep cross-media links
            
            // Prequels (Everything before)
            for (let j = 0; j < i; j++) {
                current.crossIp.push({ targetId: items[j]._id, relationType: 'prequel' });
            }
            // Sequels (Everything after)
            for (let j = i + 1; j < items.length; j++) {
                current.crossIp.push({ targetId: items[j]._id, relationType: 'sequel' });
            }
            await current.save();
        }
    };

    for (const f of franchises) {
        const items = await ContentItem.find(f.query);
        console.log(`Linking ${f.name} (${items.length} items)`);
        await linkFranchise(items);
    }

    // LINKING CROSS MEDIA (Spinoffs)
    console.log("Linking cross-media spinoffs...");
    
    // HP Books to Movies
    const hpBooks = await ContentItem.find({ title: /Harry Potter/i, category: 'novel' });
    const hpMovies = await ContentItem.find({ title: /Harry Potter/i, category: 'movie' });
    for (const book of hpBooks) {
        const matched = hpMovies.filter(m => m.title.includes(book.title.replace("Philosopher's", "Sorcerer's")));
        for (const m of matched) {
            if (!book.crossIp.some(r => r.targetId.equals(m._id))) {
                book.crossIp.push({ targetId: m._id, relationType: 'adaptation' });
                await book.save();
            }
            if (!m.crossIp.some(r => r.targetId.equals(book._id))) {
                m.crossIp.push({ targetId: book._id, relationType: 'novel' });
                await m.save();
            }
        }
    }

    // Games as spinoffs
    const fixSpinoff = async (mainTitle, gameTitle) => {
        const main = await ContentItem.findOne({ title: mainTitle });
        const game = await ContentItem.findOne({ title: gameTitle });
        if (main && game) {
            if (!main.crossIp.some(r => r.targetId.equals(game._id))) main.crossIp.push({ targetId: game._id, relationType: 'spinoff' });
            if (!game.crossIp.some(r => r.targetId.equals(main._id))) game.crossIp.push({ targetId: main._id, relationType: 'spinoff' });
            await main.save();
            await game.save();
        }
    };

    await fixSpinoff("Harry Potter and the Philosopher's Stone", "Hogwarts Legacy");
    await fixSpinoff("Spider-Man: Homecoming", "Marvel's Spider-Man Remastered");
    await fixSpinoff("Star Wars: Episode IV - A New Hope", "Star Wars Jedi: Fallen Order");

    console.log("Comprehensive Fix Done.");
    process.exit();
}

comprehensiveFix();
