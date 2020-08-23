const axios = require('axios');
const merge = require('merge');
const cheerio = require('cheerio');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const fs = require('fs');

const axiosDefaultConfig = require('../constants/axios');
const BaseAdaptor = require('./base');

const PER_PAGE = 30;

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
        url: `/cars/${this.query.brand.toLowerCase()}/used/`,
        baseURL: this.baseUrl,
        params: {
          page: this.page,
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
    const itemsDom = $('.catalog-listing-items-container .catalog-listing-description-top');

    const items = itemsDom.map((idx, el) => {
      const link = $(el).find('h3 a');
      const name = link.text().trim();
      const href = link.attr('href');
      const url = new URL(href, this.baseUrl).href;
      const year = parseInt(href.substr(1, 4), 10);
      const price = parseInt($(el).find('.item-price a').text().replace(' Juta', '000000'), 10);
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
