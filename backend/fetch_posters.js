const https = require('https');
const fs = require('fs');
const path = require('path');

const postersDir = path.join(__dirname, '../frontend/public/posters');
const bannersDir = path.join(__dirname, '../frontend/public/banners');

if (!fs.existsSync(postersDir)) fs.mkdirSync(postersDir, { recursive: true });
if (!fs.existsSync(bannersDir)) fs.mkdirSync(bannersDir, { recursive: true });

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    if (url.startsWith('//')) url = 'https:' + url;
    url = url.replace(/&amp;/g, '&');
    const file = fs.createWriteStream(dest);
    https.get(url, { headers: { 'User-Agent': 'CineLedgerBot/1.0 (contact@cineledger.com)' } }, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        return downloadFile(res.headers.location, dest).then(resolve).catch(reject);
      }
      res.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve(dest);
      });
    }).on('error', (err) => {
      fs.unlink(dest, () => {});
      reject(err);
    });
  });
}

const posterItems = [
  { name: 'kalki', url: 'https://upload.wikimedia.org/wikipedia/en/4/4c/Kalki_2898_AD.jpg' },
  { name: 'jawan', url: 'https://upload.wikimedia.org/wikipedia/en/3/39/Jawan_film_poster.jpg' },
  { name: 'stree2', url: 'https://upload.wikimedia.org/wikipedia/en/a/a1/Stree_2.jpg' },
  { name: 'pushpa2', url: 'https://upload.wikimedia.org/wikipedia/en/1/11/Pushpa_2-_The_Rule.jpg' }
];

// High quality curated cinematic movie banners
const bannerItems = [
  { name: 'kalki', url: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=1600&auto=format&fit=crop&q=80' },
  { name: 'jawan', url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=1600&auto=format&fit=crop&q=80' },
  { name: 'stree2', url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1600&auto=format&fit=crop&q=80' },
  { name: 'pushpa2', url: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=1600&auto=format&fit=crop&q=80' }
];

async function main() {
  console.log('[Poster Downloader] Downloading high-res movie posters...');
  for (const item of posterItems) {
    try {
      const dest = path.join(postersDir, `${item.name}.jpg`);
      await downloadFile(item.url, dest);
      const stat = fs.statSync(dest);
      console.log(`[Poster OK] ${item.name}.jpg (${Math.round(stat.size / 1024)} KB)`);
    } catch (err) {
      console.error(`[Poster Error] ${item.name}:`, err.message);
    }
  }

  console.log('[Banner Downloader] Downloading cinematic movie banners...');
  for (const item of bannerItems) {
    try {
      const dest = path.join(bannersDir, `${item.name}.jpg`);
      await downloadFile(item.url, dest);
      const stat = fs.statSync(dest);
      console.log(`[Banner OK] ${item.name}.jpg (${Math.round(stat.size / 1024)} KB)`);
    } catch (err) {
      console.error(`[Banner Error] ${item.name}:`, err.message);
    }
  }
}

main();
