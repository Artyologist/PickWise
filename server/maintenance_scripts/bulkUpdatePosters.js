const mongoose = require('mongoose');
const ContentItem = require('./src/models/ContentItem');
require('dotenv').config();

const mapping = {
  "The Iliad": "the-iliad.jpeg",
  "The Scarlet Letter": "the-scarlet-letter.jpeg",
  "It's a Magical World": "its-a-magical-world.jpeg",
  "The Penguin Book of Comics": "penguin-book-of-comics.jpeg",
  "Modern Comics": "modern-comics.jpeg",
  "Classics Illustrated": "classics-illustrated.jpeg",
  "Odyssey": "odyssey-comic.jpeg",
  "Dick Tracy": "dick-tracy.jpeg",
  "La bande dessinée en France": "bande-dessinee-france.jpeg",
  "Ticho hrocha": "ticho-hrocha.jpeg",
  "Zeitreise: Bilder, Maschinen, Strategien, Ratsel": "zeitreise.jpeg",
  "Humdrum": "humdrum.jpeg",
  "Transmetropolitan: Lonely city": "transmetropolitan-lonely.jpeg",
  "Talk of the Town": "talk-of-the-town.jpeg",
  "Zane Grey Stories in Picture Strips": "zane-grey.jpeg",
  "Horror Comics of the 1950's": "horror-comics-1950s.jpeg",
  "Colour Me Blind!": "colour-me-blind.jpeg",
  "Junior": "junior-comic.jpeg",
  "The Astronaughties": "astronaughties.jpeg",
  "Comic Iconoclasm": "comic-iconoclasm.jpeg",
  "Art and Architecture in the Service of Politics": "art-architecture-politics.jpeg",
  "L' illustration": "l-illustration.jpeg",
  "Bone": "bone-comic.jpeg",
  "Australian Art and Artists: in the Making": "australian-art.jpeg",
  "Erró, 1984-1998": "erro.jpeg",
  "June and Augustus": "june-and-augustus.jpeg",
  "Collection de la Fondation Maeght": "fondation-maeght.jpeg",
  "השביעיה הסודית - על פי אניד בלייטון": "secret-seven.jpeg",
  "אי המטמון": "treasure-island-comic.jpeg",
  "كان يا ما كان": "once-upon-a-time.jpeg",
  "Le Chemin des Utopies": "chemin-utopies.jpeg",
  "Coup de théâtre sur le Nil": "theatre-sur-le-nil.jpeg",
  "Bonifacio": "bonifacio.jpeg",
  "A Search for Solid Ground: The Intifada Through Israeli Eyes": "solid-ground-doc.jpeg",
  "Remembered Death": "remembered-death.jpeg"
};

async function bulkUpdate() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/pickwise');
  console.log('Connected to DB');

  for (const [title, file] of Object.entries(mapping)) {
    const res = await ContentItem.updateMany(
      { title: title },
      { $set: { posterUrl: `/posters/${file}` } }
    );
    if (res.modifiedCount > 0) {
      console.log(`✅ Updated ${title} with /posters/${file}`);
    } else {
       // try fuzzy match for things like Transmetropolitan
       const fuzzy = await ContentItem.updateMany(
         { title: { $regex: new RegExp(title, 'i') } },
         { $set: { posterUrl: `/posters/${file}` } }
       );
       if (fuzzy.modifiedCount > 0) {
          console.log(`✅ Fuzzy Updated ${title} with /posters/${file}`);
       } else {
          console.log(`❌ No match found for ${title}`);
       }
    }
  }

  process.exit();
}

bulkUpdate();
