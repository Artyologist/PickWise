require('dotenv').config();
const mongoose = require('mongoose');
const ContentItem = require('./src/models/ContentItem');

async function fixFranchises() {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    // 1. ADD DESCRIPTIONS WHERE MISSING
    const descMap = {
        "Harry Potter and the Philosopher's Stone": "Harry Potter, an orphan raised by his neglectful aunt and uncle, discovers on his eleventh birthday that he is a wizard and has been invited to attend Hogwarts School of Witchcraft and Wizardry.",
        "Harry Potter and the Sorcerer's Stone": "Harry Potter, an orphan raised by his neglectful aunt and uncle, discovers on his eleventh birthday that he is a wizard and has been invited to attend Hogwarts School of Witchcraft and Wizardry.",
        "Harry Potter and the Chamber of Secrets": "Harry returns to Hogwarts for his second year, only to find that a mysterious chamber has been opened, releasing a monster that petrifies students.",
        "Harry Potter and the Prisoner of Azkaban": "Harry's third year at Hogwarts is marred by the escape of Sirius Black, a dangerous prisoner from Azkaban who is believed to be after Harry.",
        "Harry Potter and the Goblet of Fire": "Harry is mysteriously entered into the Triwizard Tournament, a dangerous competition between three magic schools.",
        "Harry Potter and the Order of the Phoenix": "With their warning about Lord Voldemort's return scoffed at, Harry and Dumbledore are targeted by the Wizard authorities as an authoritarian bureaucrat slowly seizes power at Hogwarts.",
        "Harry Potter and the Half-Blood Prince": "As Harry Potter begins his sixth year at Hogwarts, he discovers an old book marked as 'the property of the Half-Blood Prince' and begins to learn more about Lord Voldemort's dark past.",
        "Harry Potter and the Deathly Hallows – Part 1": "As Harry, Ron, and Hermione race against time and evil to destroy the Horcruxes, they uncover the existence of the three most powerful objects in the wizarding world: the Deathly Hallows.",
        "Harry Potter and the Deathly Hallows – Part 2": "Harry, Ron, and Hermione search for Voldemort's remaining Horcruxes in their effort to destroy the Dark Lord as the final battle rages on at Hogwarts.",
        "Iron Man": "After being held captive in an Afghan cave, billionaire engineer Tony Stark creates a unique weaponized suit of armor to fight evil.",
        "Iron Man 2": "With the world now aware of his identity as Iron Man, Tony Stark must contend with both his declining health and a vengeful madman with ties to his father's legacy.",
        "Iron Man 3": "When Tony Stark's world is pulled apart by a formidable terrorist called the Mandarin, he starts an odyssey of rebuilding and retribution.",
        "Spider-Man: Homecoming": "Peter Parker balances his life as an ordinary high school student in Queens with his superhero alter-ego Spider-Man, and finds himself on the trail of a new menace prowling the skies of New York City.",
        "Spider-Man: Far From Home": "Following the events of Avengers: Endgame, Spider-Man must step up to take on new threats in a world that has changed forever.",
        "Spider-Man: No Way Home": "With Spider-Man's identity now revealed, Peter asks Doctor Strange for help. When a spell goes wrong, dangerous foes from other worlds start to appear, forcing Peter to discover what it truly means to be Spider-Man.",
        "Star Wars: Episode IV - A New Hope": "Luke Skywalker joins forces with a Jedi Knight, a cocky pilot, a Wookiee and two droids to save the galaxy from the Empire's world-destroying battle station.",
        "The Avengers": "Earth's mightiest heroes must come together and learn to fight as a team if they are going to stop the mischievous Loki and his alien army from enslaving humanity."
    };

    for (const [title, desc] of Object.entries(descMap)) {
        await ContentItem.updateMany({ title: title }, { description: desc });
    }
    console.log("Descriptions updated.");

    // Helper to link series
    const linkSeries = async (titles, category) => {
        const items = [];
        for (const t of titles) {
            const item = await ContentItem.findOne({ title: t, category: category });
            if (item) items.push(item);
        }
        for (let i = 0; i < items.length; i++) {
            const current = items[i];
            current.crossIp = current.crossIp.filter(r => !['prequel', 'sequel'].includes(r.relationType));
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

    // HP Movies
    const hpMovies = [
        "Harry Potter and the Sorcerer's Stone",
        "Harry Potter and the Philosopher's Stone",
        "Harry Potter and the Chamber of Secrets",
        "Harry Potter and the Prisoner of Azkaban",
        "Harry Potter and the Goblet of Fire",
        "Harry Potter and the Order of the Phoenix",
        "Harry Potter and the Half-Blood Prince",
        "Harry Potter and the Deathly Hallows – Part 1",
        "Harry Potter and the Deathly Hallows – Part 2"
    ];
    await linkSeries(hpMovies, 'movie');

    // IRON MAN
    const ironMan = ["Iron Man", "Iron Man 2", "Iron Man 3"];
    await linkSeries(ironMan, 'movie');

    // SPIDER-MAN MCU
    const spiderMan = ["Spider-Man: Homecoming", "Spider-Man: Far From Home", "Spider-Man: No Way Home"];
    await linkSeries(spiderMan, 'movie');

    // STAR WARS MAIN
    const starWars = [
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
    await linkSeries(starWars, 'movie');

    // SPINOFFS (Fantastic Beasts for HP)
    const fbMovies = [
        "Fantastic Beasts and Where to Find Them",
        "Fantastic Beasts: The Crimes of Grindelwald",
        "Fantastic Beasts: The Secrets of Dumbledore"
    ];
    const fbItems = await linkSeries(fbMovies, 'movie');
    
    // Link FB as Spinoff to all HP movies
    const hpAll = await ContentItem.find({ title: /Harry Potter/i, category: 'movie' });
    for (const hp of hpAll) {
        hp.crossIp = hp.crossIp.filter(r => r.relationType !== 'spinoff');
        for (const fb of fbItems) {
            hp.crossIp.push({ targetId: fb._id, relationType: 'spinoff' });
        }
        await hp.save();
    }
    // And vice versa
    for (const fb of fbItems) {
        fb.crossIp = fb.crossIp.filter(r => r.relationType !== 'spinoff');
        for (const hp of hpAll) {
            fb.crossIp.push({ targetId: hp._id, relationType: 'spinoff' });
        }
        await fb.save();
    }

    // 3. MEDIA CLEANUP (Set media to other_media to keep Row 1 clean)
    const allItems = await ContentItem.find({});
    for (const item of allItems) {
        let changed = false;
        for (const rel of item.crossIp) {
            if (['spinoff', 'adaptation', 'novel'].includes(rel.relationType)) {
                 const target = await ContentItem.findById(rel.targetId);
                 if (target && ['novel', 'videogame', 'documentary'].includes(target.category)) {
                     rel.relationType = 'other_media'; 
                     changed = true;
                 }
            }
        }
        if (changed) await item.save();
    }

    console.log("Franchise fixes completed.");
    process.exit();
}

fixFranchises().catch(err => {
    console.error(err);
    process.exit(1);
});
