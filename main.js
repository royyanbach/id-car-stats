const Mobil123 = require('./adaptor/mobil123');
const Garasi = require('./adaptor/garasi');
const Oto = require('./adaptor/oto');
const Momobil = require('./adaptor/momobil');
const Carmudi = require('./adaptor/carmudi');
const cheerio = require('cheerio');
const fs = require('fs');

const fetcher = new Momobil();
fetcher.setQuery({
  brand: 'Mazda',
  // maxPrice: 300000000,
  condition: 'USED',
}).setPage(1);

fetcher.fetchData().then(data => {
  console.log(data)
}).catch(err => console.error(err));

// const data = fs.readFileSync('result.html', 'utf-8');
// const $ = cheerio.load(data);
// const result = $('.catalog-listing-items-container .catalog-listing-description-top').map((idx, el) => {
//   const link = $(el).find('h3 a');
//   const name = link.text().trim();
//   const url = link.attr('href');
//   const year = parseInt(url.substr(1, 4), 10);
//   const price = parseInt($(el).find('.item-price a').text().replace(' Juta', '000000'), 10);
//   return {
//     name,
//     price,
//     url,
//     year,
//   }
// }).get();

// const jsonLds = $('script[type="application/ld+json"]');
// if (jsonLds.length) {
//   let jsonLdString = jsonLds[0].children[0].data;
//   if(jsonLdString){
//     jsonLdString = jsonLdString.trim().substr(1).slice(0, -1).replace('//If they search brand', '').replace('//If they search model', '');
//     // console.log(jsonLdString);
//     const jsonLdObj = JSON.parse(jsonLdString);

//     if (jsonLdObj.numberOfItems) {
//       const items = jsonLdObj.itemListElement.map(item => {
//         const yearMatch = item.item.name.match(/(\d{4})/g);
//         const year = yearMatch && yearMatch.length ? yearMatch[0] : '';
//         const name = `${item.item.brand.name} ${item.item.model}`;

//         return {
//           name,
//           price: item.item.offers.price,
//           url: item.item.mainEntityOfPage,
//           year: parseInt(year, 10),
//         }
//       });

//       const csvWriter = createCsvWriter({
//         path: 'result.csv',
//         append: true,
//         header: [
//           { id: 'name', title: 'Name' },
//           { id: 'year', title: 'Year' },
//           { id: 'price', title: 'Price' },
//           { id: 'url', title: 'URL' }
//         ]
//       });

//       // await csvWriter.writeRecords(items);
//       console.log(items)
//     }
//   }
// }

