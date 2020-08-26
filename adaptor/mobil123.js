const axios = require('axios');
const cheerio = require('cheerio');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const merge = require('merge');
const fs = require('fs');

const condition = require('../constants/condition');
const axiosDefaultConfig = require('../constants/axios');

const COUNTRY = 'Indonesia';
const PER_PAGE = 25;

module.exports = class Mobil123 {
  constructor() {
    this.baseUrl = 'https://www.mobil123.com/';
    this.page = 1;
    this.query = {
      brand: null,
      model: null,
      condition: condition[0],
      minPrice: null,
      maxPrice: null,
    }
  }

  setPage(page) {
    this.page = page;
    return this;
  }

  setQuery({ brand, model, condition, minPrice, maxPrice } = {}) {
    if (brand) {
      this.query.brand = brand;
    }

    if (model) {
      this.query.model = model;
    }

    if (condition) {
      this.query.condition = condition;
    }

    if (minPrice) {
      this.query.minPrice = minPrice;
    }

    if (maxPrice) {
      this.query.maxPrice = maxPrice;
    }

    return this;
  }

  generateRequestPath() {
    let path = '/mobil-dijual';
    // this.query.condition === condition[0] ? '/mobil-dijual' : '/mobil-bekas-dijual';

    if (this.query.brand) {
      path += `/${this.query.brand}`.toLowerCase();
    }

    if (this.query.model) {
      path += `/${this.query.model}`.toLowerCase();
    }

    path += `/${COUNTRY}`.toLowerCase();
    return path;
  }

  async fetchData() {
    const minPriceParam = this.query.minPrice ? { min_price: this.query.minPrice } : {};
    const maxPriceParam = this.query.maxPrice ? { max_price: this.query.maxPrice } : {};
    const conditionParam = this.query.condition === condition[1] ? { type: 'used' } : {};
    const pageParam = this.page > 1 ? { page_number: this.page } : {};
    const params = merge(
      true,
      {
        _pjax: '#classified-listings-result',
        sort: 'modification_date_search.desc',
        page_size: PER_PAGE,
      },
      minPriceParam,
      maxPriceParam,
      conditionParam,
      pageParam,
    );
    const options = merge(
      true,
      axiosDefaultConfig,
      {
        url: this.generateRequestPath(),
        baseURL: this.baseUrl,
        params,
      },
      {
        headers: {
          'x-pjax': true,
          'x-requested-with': 'XMLHttpRequest',
          'x-pjax-container': '#classified-listings-result',
        }
      }
    )

    console.log(options.params);
    const { data } = await axios.request(options);
    // fs.writeFileSync('result.html', data);
    await this.processData(data, true);
  }

  async processData(data, recursive = false) {
    const $ = cheerio.load(data);
    const jsonLds = $('script[type="application/ld+json"]');
    if (jsonLds.length) {
      let jsonLdString = jsonLds[0].children[0].data;
      if(jsonLdString){
        // jsonLdString = jsonLdString.trim().substr(1).slice(0, -1).replace(/\/\*[\s\S]*?\*\/|([^\\:]|^)\/\/.*$/gm, '');
        jsonLdString = jsonLdString.trim().substr(1).slice(0, -1).replace('//If they search brand', '').replace('//If they search model', '');
        const jsonLdObj = JSON.parse(jsonLdString);

        if (jsonLdObj.numberOfItems) {
          const items = jsonLdObj.itemListElement.map(item => {
            const yearMatch = item.item.name.match(/(\d{4})/g);
            const year = yearMatch && yearMatch.length ? yearMatch[0] : '';
            const name = `${item.item.brand.name} ${item.item.model}`;
  
            return {
              name,
              price: item.item.offers.price,
              url: item.item.mainEntityOfPage,
              year: parseInt(year, 10),
            }
          });
  
          const csvWriter = createCsvWriter({
            path: 'result.csv',
            append: true,
            header: [
              { id: 'name', title: 'Name' },
              { id: 'year', title: 'Year' },
              { id: 'price', title: 'Price' },
              { id: 'url', title: 'URL' }
            ]
          });

          await csvWriter.writeRecords(items);
        }

        if (recursive) {
          this.page = this.page + 1;
          return await this.fetchData();
        }
      }
    }
  }
}
