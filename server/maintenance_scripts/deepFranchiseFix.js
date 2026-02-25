require('dotenv').config();
const mongoose = require('mongoose');
const ContentItem = require('./src/models/ContentItem');

async function deepFix() {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Deep Fix Started...");

    // Helper to reset and link a sequential series (Movies/Books)
    const linkSequential = async (titles, category) => {
        const items = [];
        for (const t of titles) {
            const item = await ContentItem.findOne({ title: t, category: category });
            if (item) items.push(item);
        }
        for (let i = 0; i < items.length; i++) {
            const current = items[i];
            // STRICT CLEAR for sequential series
            current.crossIp = [];
            
            for (let j = 0; j < items.length; j++) {
                if (i === j) continue;
                current.crossIp.push({
                    targetId: items[j]._id,
                    relationType: j < i ? 'prequel' : 'sequel'
                });
            }
            await current.save();
        }
        return items;
    };

    // Helper to link spinoffs
    const linkSpinoffs = async (mainItems, spinoffItems) => {
        for (const main of mainItems) {
            for (const spinoff of spinoffItems) {
                if (!main.crossIp.some(r => r.targetId.equals(spinoff._id))) {
                    main.crossIp.push({ targetId: spinoff._id, relationType: 'spinoff' });
                }
                if (!spinoff.crossIp.some(r => r.targetId.equals(main._id))) {
                    spinoff.crossIp.push({ targetId: main._id, relationType: 'spinoff' });
                }
            }
            await main.save();
        }
        for (const spinoff of spinoffItems) {
            await spinoff.save();
        }
    };

    // Helper to link other media (Novel, Game, Doc, Anime, TV)
    const linkOtherMedia = async (mainItems, otherItems) => {
        for (const main of mainItems) {
            for (const other of otherItems) {
                if (!main.crossIp.some(r => r.targetId.equals(other._id))) {
                    main.crossIp.push({ targetId: other._id, relationType: 'other_media' });
                }
                if (!other.crossIp.some(r => r.targetId.equals(main._id))) {
                    other.crossIp.push({ targetId: main._id, relationType: 'other_media' });
                }
            }
            await main.save();
        }
        for (const other of otherItems) {
            await other.save();
        }
    };

    // --- HARRY POTTER ---
    const hpMovies = await linkSequential([
        "Harry Potter and the Philosopher's Stone",
        "Harry Potter and the Chamber of Secrets",
        "Harry Potter and the Prisoner of Azkaban",
        "Harry Potter and the Goblet of Fire",
        "Harry Potter and the Order of the Phoenix",
        "Harry Potter and the Half-Blood Prince",
        "Harry Potter and the Deathly Hallows – Part 1",
        "Harry Potter and the Deathly Hallows – Part 2"
    ], 'movie');

    const hpNovels = await linkSequential([
        "Harry Potter and the Philosopher's Stone",
        "Harry Potter and the Chamber of Secrets",
        "Harry Potter and the Prisoner of Azkaban",
        "Harry Potter and the Goblet of Fire",
        "Harry Potter and the Order of the Phoenix",
        "Harry Potter and the Half-Blood Prince",
        "Harry Potter and the Deathly Hallows"
    ], 'novel');

    const fbMovies = await linkSequential([
        "Fantastic Beasts and Where to Find Them",
        "Fantastic Beasts: The Crimes of Grindelwald",
        "Fantastic Beasts: The Secrets of Dumbledore"
    ], 'movie');

    const hpDoc = await ContentItem.find({ title: /Return to Hogwarts/i });
    const hpGame = await ContentItem.find({ title: /Hogwarts Legacy/i });

    await linkSpinoffs(hpMovies, fbMovies); // FB is spinoff of HP
    await linkOtherMedia(hpMovies, hpNovels); // Novels for HP Movies
    await linkOtherMedia(hpMovies, hpDoc); // Doc for HP Movies
    await linkOtherMedia(hpMovies, hpGame); // Game for HP Movies

    // --- STAR WARS ---
    const swMovies = await linkSequential([
        "Star Wars: Episode I - The Phantom Menace",
        "Star Wars: Episode II - Attack of the Clones",
        "Star Wars: Episode III - Revenge of the Sith",
        "Star Wars: Episode IV - A New Hope",
        "Star Wars: Episode V - The Empire Strikes Back",
        "Star Wars: Episode VI - Return of the Jedi",
        "Star Wars: The Force Awakens",
        "Star Wars: The Last Jedi",
        "Star Wars: The Rise of Skywalker"
    ], 'movie');

    const swGames = await linkSequential([
        "Star Wars Jedi: Fallen Order",
        "Star Wars Jedi: Survivor"
    ], 'videogame');

    const swComics = await ContentItem.find({ title: /Star Wars/i, category: 'comic' });
    
    await linkOtherMedia(swMovies, swGames);
    await linkOtherMedia(swMovies, swComics);

    // --- IRON MAN ---
    const imMovies = await linkSequential([
        "Iron Man",
        "Iron Man 2",
        "Iron Man 3"
    ], 'movie');

    const imAnime = await ContentItem.find({ title: /Iron Man/i, category: 'anime' });
    const imTV = await ContentItem.find({ title: /Iron Man/i, category: 'tv' });

    await linkOtherMedia(imMovies, imAnime);
    await linkOtherMedia(imMovies, imTV);

    // --- SPIDER-MAN ---
    const spMovies = await linkSequential([
        "Spider-Man: Homecoming",
        "Spider-Man: Far From Home",
        "Spider-Man: No Way Home"
    ], 'movie');

    const spGames = await linkSequential([
        "Marvel's Spider-Man Remastered",
        "Marvel's Spider-Man: Miles Morales",
        "Marvel's Spider-Man 2"
    ], 'videogame');

    await linkOtherMedia(spMovies, spGames);

    console.log("Deep Fix Done.");
    process.exit();
}

deepFix().catch(err => {
    console.error(err);
    process.exit(1);
});
