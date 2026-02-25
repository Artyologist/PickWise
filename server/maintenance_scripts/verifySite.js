const axios = require('axios');

async function verifySite() {
    const API_URL = 'http://localhost:4000/api';
    const categories = ['movie', 'tv', 'videogame', 'anime', 'manga', 'novel', 'comic', 'documentary'];

    console.log('--- Verifying Category Loading ---');
    for (const cat of categories) {
        try {
            const res = await axios.post(`${API_URL}/search`, { category: cat, page: 1 });
            console.log(`[${cat.toUpperCase()}] Status: ${res.data.ok ? 'OK' : 'FAIL'} | Items found: ${res.data.results?.length || 0}`);
            if (res.data.results?.length > 0) {
                const firstItem = res.data.results[0];
                console.log(`  > Example: ${firstItem.title} (${firstItem.year})`);
                if (!firstItem.posterUrl) console.warn(`  ⚠️ MISSING POSTER for ${firstItem.title}`);
            }
        } catch (err) {
            console.error(`[${cat.toUpperCase()}] ERROR:`, err.message);
        }
    }

    console.log('\n--- Verifying Filters (GENRES) ---');
    try {
        const cat = 'movie';
        const genre = 'Action';
        const res = await axios.post(`${API_URL}/search`, { category: cat, genres: [genre], page: 1 });
        console.log(`[FILTER: ${cat}/${genre}] Status: ${res.data.ok ? 'OK' : 'FAIL'} | Items: ${res.data.results?.length || 0}`);
        if (res.data.results?.length > 0) {
            const filtered = res.data.results.every(i => i.genres?.includes(genre));
            console.log(`  > Schema validation (Every item has ${genre}): ${filtered ? 'YES' : 'SOME MISSING (Normal for external API fallback)'}`);
        }
    } catch (err) {
        console.error('FILTER ERROR:', err.message);
    }

    console.log('\n--- Verifying Global Search ---');
    try {
        const query = 'Harry Potter';
        const res = await axios.get(`${API_URL}/global-search?q=${encodeURIComponent(query)}`);
        const total = Object.values(res.data.results).reduce((sum, list) => sum + list.length, 0);
        console.log(`[GLOBAL SEARCH: ${query}] Status: ${res.data.ok ? 'OK' : 'FAIL'} | Total found: ${total}`);
    } catch (err) {
        console.error('GLOBAL SEARCH ERROR:', err.message);
    }

    process.exit();
}

verifySite();
