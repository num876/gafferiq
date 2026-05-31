const https = require('https');

const options = {
  hostname: 'en.wikipedia.org',
  path: '/w/api.php?action=query&prop=revisions&rvprop=content&titles=Arsenal_F.C.&format=json',
  headers: { 'User-Agent': 'GafferIQ/1.0 (contact@gafferiq.com)' }
};

https.get(options, (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    const json = JSON.parse(data);
    const pages = json.query.pages;
    const pageId = Object.keys(pages)[0];
    const content = pages[pageId].revisions[0]['*'];
    
    // Parse wikitext for players: {{fs player|no=1|nat=ESP|name=[[David Raya]]|pos=GK}}
    const regex = /\{\{fs player\s*\|.*?(?:name|n)\s*=\s*(?:\[\[(.*?)\]\]|([^|]+)).*?pos\s*=\s*([A-Z]+)/gi;
    
    let match;
    console.log("Arsenal Squad:");
    while ((match = regex.exec(content)) !== null) {
      // match[1] is the linked name, match[2] is unlinked name, match[3] is position
      const name = match[1] || match[2];
      const pos = match[3];
      // strip out piped links e.g. [[Martin Ødegaard|Ødegaard]] -> Ødegaard
      const cleanName = name ? name.split('|').pop().replace(/\[\[|\]\]/g, '').trim() : '';
      if (cleanName) {
        console.log(`${cleanName} (${pos})`);
      }
    }
  });
}).on('error', (e) => {
  console.error(e);
});
