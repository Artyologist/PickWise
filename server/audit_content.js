const mongoose = require('mongoose');
const ContentItem = require('./src/models/ContentItem');
require('dotenv').config();

const MONGO = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/pickwise';

async function runAudit() {
  try {
    await mongoose.connect(MONGO);
    console.log('--- STARTING CONTENT AUDIT ---');

    const items = await ContentItem.find({});
    console.log(`Auditing ${items.length} items...\n`);

    const report = {
      total: items.length,
      categories: {},
      missingPoster: [],
      missingYear: [],
      missingGenres: [],
      missingDescription: []
    };

    items.forEach(item => {
      const cat = item.category;
      if (!report.categories[cat]) report.categories[cat] = { total: 0, missingInfo: 0 };
      report.categories[cat].total++;

      const missing = [];
      if (!item.posterUrl) { missing.push('Poster'); report.missingPoster.push(item.title); }
      if (!item.year) { missing.push('Year'); report.missingYear.push(item.title); }
      if (!item.genres || item.genres.length === 0) { missing.push('Genres'); report.missingGenres.push(item.title); }
      if (!item.shortDescription && !item.description) { missing.push('Description'); report.missingDescription.push(item.title); }

      if (missing.length > 0) {
        report.categories[cat].missingInfo++;
      }
    });

    console.log('--- CATEGORY BREAKDOWN ---');
    Object.entries(report.categories).forEach(([cat, stats]) => {
      console.log(`${cat.toUpperCase()}: ${stats.total} total, ${stats.missingInfo} have missing basic info.`);
    });

    console.log('\n--- SUMMARY ---');
    console.log(`Items missing Posters: ${report.missingPoster.length}`);
    console.log(`Items missing Year: ${report.missingYear.length}`);
    console.log(`Items missing Genres: ${report.missingGenres.length}`);
    console.log(`Items missing Description: ${report.missingDescription.length}`);

    console.log('\n--- RECOMMENDATION ---');
    console.log('Use "Update Intelligence" on category pages or individual content pages to fetch missing metadata from live APIs.');
    
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

runAudit();
