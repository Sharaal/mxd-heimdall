const rp = require('request-promise');

module.exports = class {
  constructor({ apikey, appid, hostname, pageSize, version }) {
    this.apikey = apikey;
    this.appid = appid;
    this.hostname = hostname || 'heimdall.maxdome.de';
    this.pageSize = pageSize;
    this.version = version || 'v1';
  }

  getPath(path) {
    if (path.includes('?')) {
      path += '&';
    } else {
      path += '?';
    }
    path += `apikey=${this.apikey}&appid=${this.appid}`;
    return path;
  }

  getUrl(path) {
    return `https://${this.hostname}/api/${this.version}/${path}`;
  }

  getHeaders(headers) {
    return Object.assign(
      {
        accept: 'application/json',
        client: 'mxd_package',
        clienttype: 'Webportal',
        'content-type': 'application/json',
        language: 'de_DE',
        'maxdome-origin': 'maxdome.de',
        platform: 'web'
      },
      headers || {}
    );
  }

  async request(path, { body, headers, method, transform }) {
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

  async get(path, { body, headers, transform }) {
    return this.request(path, { body, headers, transform });
  }

  async post(path, { body, headers, transform }) {
    return this.request(path, { body, headers, method: 'post', transform });
  }

  async put(path, { body, headers, transform }) {
    return this.request(path, { body, headers, method: 'put', transform });
  }

  async delete(path, { body, headers, transform }) {
    return this.request(path, { body, headers, method: 'delete', transform });
  }

  async getAssets(query) {
    return this.get(`mxd/assets?${query}`, {
      transform: data => data.assetList.map(asset => {
        let title = asset.title;
        if (asset['@class'] === 'MultiAssetTvSeriesSeason') {
          title += ` (Season ${asset.number})`;
        }
        return { id: asset.id, title, description: asset.descriptionShort };
      })
    });
  }
};
