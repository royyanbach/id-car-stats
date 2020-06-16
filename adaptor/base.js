const condition = require('../constants/condition');

module.exports = class BaseADaptor {
  constructor() {
    this.baseUrl = '';
    this.page = 1;
    this.query = {
      brand: null,
      model: null,
      condition: condition[0],
      minPrice: 0,
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
}
