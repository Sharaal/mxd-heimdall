class AssetsQuery {
  constructor(ids) {
    this.queries = [];
    if (ids) {
      this.filter('assetId', ids);
    }
  }

  query(key, value) {
    this.queries.push(`${encodeURIComponent(key)}=${encodeURIComponent(value)}`);
    return this;
  }

  param(key, alias, values) {
    let value = alias;
    if (values) {
      if (Array.isArray(values)) {
        value += `~${values.join('|')}`;
      } else {
        value += `~${values}`;
      }
    }
    this.query(key, value);
    return this;
  }

  filter(alias, restrictions) {
    const alternativeAliases = {
      package: 'hasPackageContent',
      store: 'availableWithoutPackage',
    };
    if (alternativeAliases[alias]) {
      alias = alternativeAliases[alias];
    }
    this.param('filter[]', alias, restrictions);
    return this;
  }

  sort(alias, order) {
    this.param('sort[]', alias, order);
    return this;
  }

  toString() {
    return this.queries.join('&');
  }
}

module.exports = AssetsQuery;
