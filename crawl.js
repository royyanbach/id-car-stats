const cheerio = require('cheerio');
const fs = require('fs');

const BRANDS = require('./constants/brands');

const Mobil123 = require('./adaptor/mobil123');
// const Garasi = require('./adaptor/garasi');
// const Oto = require('./adaptor/oto');
// const Momobil = require('./adaptor/momobil');
// const Carmudi = require('./adaptor/carmudi');

const fetcher = new Mobil123();
fetcher.setQuery({
  brand: BRANDS[0],
  // maxPrice: 300000000,
  condition: 'USED',
}).setPage(1);

fetcher.fetchData().then(data => {
  console.log('done');
}).catch(err => console.error(err.message));
