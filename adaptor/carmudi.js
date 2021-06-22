const axios = require('axios');
const merge = require('merge');
const cheerio = require('cheerio');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const fs = require('fs');

const axiosDefaultConfig = require('../constants/axios');
const BaseAdaptor = require('./base');

const PER_PAGE = 25;

module.exports = class Carmudi extends BaseAdaptor {
  constructor() {
    super();
    this.baseUrl = 'https://www.carmudi.co.id/';
  }

  async fetchData() {
    const options = merge(
      true,
      axiosDefaultConfig,
      {
        url: `/en/used-cars-for-sale/${this.query.brand.toLowerCase()}/indonesia`,
        baseURL: this.baseUrl,
        params: {
          page_number: this.page,
          page_size: PER_PAGE,
        }
      }
    );

    console.log(options);
    const { data } = await axios.request(options);
    // fs.writeFileSync('result.html', data);
    await this.processData(data, true);
  }

  async processData(data, recursive = false) {
    const $ = cheerio.load(data);
    const itemsDom = $('.listing--card');

    const items = itemsDom.map((idx, el) => {
      const dataAttr = $(el).data();
      const { make, model, url, year } = dataAttr;
      const name = `${make} ${model}`;
      const price = parseInt($(el).find('.listing__price').text().replace(/(Rp|\.)/g, '').trim(), 10);
      return {
        name,
        price,
        url,
        year,
      }
    }).get();

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

    if (recursive && itemsDom.length === PER_PAGE) {
      this.page = this.page + 1;
      return await this.fetchData();
    }
  }
}
