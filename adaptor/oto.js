const axios = require('axios');
const merge = require('merge');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

const axiosDefaultConfig = require('../constants/axios');
const BaseAdaptor = require('./base');

const PATH = '/v1/inventory/index';
const PER_PAGE = 20;

module.exports = class Mobil123 extends BaseAdaptor {
  constructor() {
    super();
    this.baseUrl = 'https://newcarsapi.carbay.com/';
  }

  async fetchData() {
    const options = merge(
      true, 
      axiosDefaultConfig,
      {
        url: PATH,
        // method: 'POST',
        baseURL: this.baseUrl,
        params: {
          'business_unit': 'car',
          'lang_code': 'id',
          'country_code': 'id',
          'source_id': 'Oto',
          'ip_address': '139.192.26.126',
          'sub_source_id': 'Desktop',
          'platform': 'web',
        },
        data: {
          search: this.query.brand.toLowerCase(),
          pageSize: PER_PAGE,
          page: this.page,
          sort: 'createdAt',
          order: 'desc',
          priceRange: JSON.stringify({
            min: this.query.minPrice,
            max: this.query.maxPrice || 10000000000,
          }),
        }
      }
    );

    console.log(options);
    const { data } = await axios.request(options);

    const items = data.data.items.map(item => {
      const name = `${item.brand} ${item.model}`.replace(/\((.*?)\)/g, '').trim();

      return {
        name,
        price: item.price,
        url: item.absoluteUrl,
        year: item.registrationYear,
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

    if (data.data && data.data._meta && data.data._meta.pageCount && data.data._meta.pageCount > this.page) {
      this.page = this.page + 1;
      return this.fetchData();
    } else {
      return items;
    }
  }
}
