require('dotenv').config();
const mongoose = require('mongoose');
const ContentItem = require('./src/models/ContentItem');

async function linkIPs() {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Linking universes...");

    // Helper: Find item by title (relaxed) and category
    const find = async (title, category) => {
        const query = { title: { $regex: new RegExp(`^${title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') } };
        if (category) query.category = category;
        return await ContentItem.findOne(query);
    };

    // Helper: Add relation
    const addRelation = async (source, target, type) => {
        if (!source || !target) return;
        
        // Add to source
        const exists = source.crossIp.find(r => r.targetId.toString() === target._id.toString());
        if (!exists) {
            source.crossIp.push({ targetId: target._id, relationType: type });
            await source.save();
        }

        // Add inverse if needed (e.g., if A is prequel of B, then B is sequel of A)
        let inverseType = type;
        if (type === 'prequel') inverseType = 'sequel';
        else if (type === 'sequel') inverseType = 'prequel';

        const existsInverse = target.crossIp.find(r => r.targetId.toString() === source._id.toString());
        if (!existsInverse) {
            target.crossIp.push({ targetId: source._id, relationType: inverseType });
            await target.save();
        }
    };

    // 1. HARRY POTTER
    const hpMovies = [
        "Harry Potter and the Philosopher's Stone",
        "Harry Potter and the Chamber of Secrets",
        "Harry Potter and the Prisoner of Azkaban",
        "Harry Potter and the Goblet of Fire",
        "Harry Potter and the Order of the Phoenix",
        "Harry Potter and the Half-Blood Prince",
        "Harry Potter and the Deathly Hallows – Part 1",
        "Harry Potter and the Deathly Hallows – Part 2"
    ];

    let lastMovie = null;
    for (const title of hpMovies) {
        const current = await find(title, 'movie');
        if (current && lastMovie) {
            await addRelation(lastMovie, current, 'sequel');
        }
        
        // Link to its Novel
        const novel = await find(title.replace(' – Part 1', '').replace(' – Part 2', ''), 'novel');
        if (current && novel) await addRelation(current, novel, 'novel');

        lastMovie = current;
    }

    // Hogwarts Legacy
    const legacy = await find("Hogwarts Legacy", "videogame");
    if (legacy && lastMovie) {
        await addRelation(legacy, lastMovie, 'spinoff'); // Loosely related
    }

    // 2. STAR WARS
    const swMovies = [
        "Star Wars: Episode I - The Phantom Menace",
        "Star Wars: Episode II - Attack of the Clones",
        "Star Wars: Episode III - Revenge of the Sith",
        "Star Wars: Episode IV - A New Hope",
        "Star Wars: Episode V - The Empire Strikes Back",
        "Star Wars: Episode VI - Return of the Jedi",
        "Star Wars: The Force Awakens",
        "Star Wars: The Last Jedi",
        "Star Wars: The Rise of Skywalker"
    ];

    lastMovie = null;
    for (const title of swMovies) {
        const current = await find(title, 'movie');
        if (current && lastMovie) {
            await addRelation(lastMovie, current, 'sequel');
        }
        lastMovie = current;
    }

    // 3. MARVEL: IRON MAN
    const im1 = await find("Iron Man", "movie");
    const im2 = await find("Iron Man 2", "movie");
    const im3 = await find("Iron Man 3", "movie");
    const avengers = await find("The Avengers", "movie");

    if (im1 && im2) await addRelation(im1, im2, 'sequel');
    if (im2 && im3) await addRelation(im2, im3, 'sequel');
    if (im1 && avengers) await addRelation(im1, avengers, 'sequel'); // Transition to team up

    // 4. MARVEL: SPIDER-MAN
    const spidey1 = await find("Spider-Man: Homecoming", "movie");
    const spidey2 = await find("Spider-Man: Far From Home", "movie");
    const spidey3 = await find("Spider-Man: No Way Home", "movie");

    if (spidey1 && spidey2) await addRelation(spidey1, spidey2, 'sequel');
    if (spidey2 && spidey3) await addRelation(spidey2, spidey3, 'sequel');
    if (spidey1 && avengers) await addRelation(spidey1, avengers, 'prequel'); // Technically happens after Avengers 1 but linked to franchise

    console.log("IP linking completed.");
    process.exit();
}

linkIPs();
