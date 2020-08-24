const axios = require('axios');
const merge = require('merge');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

const axiosDefaultConfig = require('../constants/axios');
const BaseAdaptor = require('./base');

const PATH = '/public/products';
const PER_PAGE = 24;

module.exports = class Mobil123 extends BaseAdaptor {
  constructor() {
    super();
    this.baseUrl = 'https://api.momobil.id/';
  }

  async fetchData() {
    const offset = (this.page - 1) * PER_PAGE;
    const options = merge(
      true, 
      axiosDefaultConfig,
      {
        url: PATH,
        baseURL: this.baseUrl,
        params: {
          brands: this.query.brand,
          limit: PER_PAGE,
          offset,
          portofolio: 'ucar',
          view: 'mozaic',
        },
      }
    );

    console.log(options);
    const { data } = await axios.request(options);
    
    if (!data.data) {
      return;
    }

    const items = data.data.map(item => {
      const year = item.attributes.attributes.year;
      const host = 'https://momobil.id/';
      const path = 'detail-mobil-bekas/';
      const brand = item.attributes.attributes.brand_name;
      const itemName = item.attributes.name.replace(/([^a-zA-Z\d\s:]|\s)/g, '-');
      const url = `${host}${path}${brand}/${itemName}-${year}-${item.id}`.toLowerCase();

      return {
        name: item.attributes.name,
        price: item.attributes.price,
        url,
        year,
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

    if (data.meta && data.meta.total && Array.isArray(data.data) && offset + data.data.length <= data.meta.total ) {
      this.page = this.page + 1;
      return this.fetchData();
    } else {
      return items;
    }
  }
}
