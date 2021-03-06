const axios = require('axios');
const merge = require('merge');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

const axiosDefaultConfig = require('../constants/axios');
const BaseAdaptor = require('./base');

const PATH = '/api/vehicles';

module.exports = class Garasi extends BaseAdaptor {
  constructor() {
    super();
    this.baseUrl = 'https://garasi.id/';
    this.next = '';
  }

  setNext(next) {
    this.next = next;
    return this;
  }

  async fetchData() {
    const options = merge(
      true, 
      axiosDefaultConfig,
      {
        url: PATH,
        baseURL: this.baseUrl,
        params: {
          'brand_name': this.query.brand,
          q: this.query.brand,
          namespace: 'search_reguler',
        },
        headers: {
          'frontend-mode': 'csr'
        }
      }
    );

    if (this.next) {
      options.params['next'] = this.next;
    }

    console.log(options.params);
    const { data } = await axios.request(options);

    const items = data.data.map(item => {
      const name = `${item.brand} ${item.model}`;
      const url = `https://garasi.id/mobil-bekas/${item.year}-${item.brand.replace(' ', '-')}-${item.model.replace(' ', '-')}/${item.short_id}`.toLowerCase();

      return {
        name,
        price: item.price,
        url,
        year: item.year,
      }
    })

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

    if (data.meta && data.meta.cursor && data.meta.cursor.next) {
      this.setNext(data.meta.cursor.next);
      return this.fetchData();
    } else {
      return items;
    }
  }
}
