const axios = require('axios');
const cheerio = require('cheerio');

async function test() {
  const searchUrl = 'https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=Arsenal%20F.C.&utf8=&format=json';
  const r1 = await axios.get(searchUrl);
  const title = r1.data.query.search[0].title;
  console.log('Title:', title);
  
  const parseUrl = 'https://en.wikipedia.org/w/api.php?action=parse&page=' + encodeURIComponent(title) + '&prop=text&format=json';
  const r2 = await axios.get(parseUrl);
  
  const $ = cheerio.load(r2.data.parse.text['*']);
  const players = [];
  $('td.fn').each((i, el) => {
    players.push($(el).text().trim().replace(/ \(.+\)/, ''));
  });
  console.log(players);
}
test();
