const rp = require('request-promise');

const appPkg = require(`${process.cwd()}/package.json`);
const libPkg = require('../package.json');

module.exports = class {
  constructor({ apikey, appid, hostname: hostname = 'heimdall.maxdome.de', pageSize, version: version = 'v1' }) {
    this.apikey = apikey;
    this.appid = appid;
    this.hostname = hostname;
    this.pageSize = pageSize;
    this.version = version;
  }

  getPath(path = '') {
    if (path.includes('?')) {
      path += '&';
    } else {
      path += '?';
    }
    path += `apikey=${this.apikey}&appid=${this.appid}`;
    return path;
  }

  getUrl(path = '') {
    return `https://${this.hostname}/api/${this.version}/${path}`;
  }

  getFrom() {
    let author = appPkg.author;
    if (author) {
      if (typeof author === 'object') {
        author = `${author.name} <${author.email}> (${author.url})`;
      }
      return author;
    }
  }

  getUserAgent() {
    return `${appPkg.name} v${appPkg.version} via ${libPkg.name} v${libPkg.version}`;
  }

  getHeaders(headers = {}) {
    return Object.assign(
      {
        accept: 'application/json',
        client: 'mxd_store',
        clienttype: 'Webportal',
        'content-type': 'application/json',
        from: this.getFrom(),
        language: 'de_DE',
        'maxdome-origin': 'maxdome.de',
        platform: 'web',
        'user-agent': this.getUserAgent()
      },
      headers
    );
  }

  async request(path = '', { body, headers, method, transform } = {}) {
    try {
      return await rp({
        body: body,
        method: method || 'get',
        url: this.getUrl(this.getPath(path)),
        headers: this.getHeaders(headers),
        json: true,
        transform: transform
      });
    } catch (e) {
      throw new Error(e.error.message);
    }
  }

  async get(path = '', { body, headers, transform } = {}) {
    return this.request(path, { body, headers, transform });
  }

  async post(path = '', { body, headers, transform } = {}) {
    return this.request(path, { body, headers, method: 'post', transform });
  }

  async put(path = '', { body, headers, transform } = {}) {
    return this.request(path, { body, headers, method: 'put', transform });
  }

  async delete(path = '', { body, headers, transform } = {}) {
    return this.request(path, { body, headers, method: 'delete', transform });
  }

  async getAssets(query, { headers } = {}) {
    return this.get(`mxd/assets?${query}`, {
      headers,
      transform: data => data.assetList.map(asset => {
        let title = asset.title;
        if (asset['@class'] === 'MultiAssetTvSeriesSeason') {
          title += ` (Season ${asset.number})`;
        }
        return {
          id: asset.id,
          title,
          description: asset.descriptionShort,
          remembered: asset.remembered
        };
      })
    });
  }
};
