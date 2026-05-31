const https = require('https');

https.get('https://en.wikipedia.org/wiki/Arsenal_F.C.', (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    // Search for "Current squad"
    const squadIndex = data.indexOf('id="Current_squad"');
    if (squadIndex === -1) {
      console.log('Current squad not found');
      return;
    }
    const tableIndex = data.indexOf('<table class="sortable', squadIndex);
    const tableEnd = data.indexOf('</table>', tableIndex);
    const tableHtml = data.substring(tableIndex, tableEnd);
    
    // Very naive regex to find player names
    // <th><a href="...">Name</a></th>
    const matches = tableHtml.match(/<th[^>]*scope="row"[^>]*><a[^>]*>([^<]+)<\/a><\/th>/g);
    if (matches) {
      console.log("Found players:");
      matches.slice(0, 5).forEach(m => {
        const name = m.replace(/<[^>]+>/g, '');
        console.log(name);
      });
    } else {
      console.log("No players found in table");
    }
  });
}).on('error', (e) => {
  console.error(e);
});
