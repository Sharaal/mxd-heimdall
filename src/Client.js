const fs = require('fs');
const rp = require('request-promise');

const appPkg = JSON.parse(fs.readFileSync(`${process.cwd()}/package.json`));
const libPkg = JSON.parse(fs.readFileSync(`${__dirname}/../package.json`));

class Client {
  constructor({
    apiHost: apiHost = 'https://heimdall.maxdome.de',
    apiKey: apiKey = process.env.HEIMDALL_APIKEY,
    appId: appId = process.env.HEIMDALL_APPID,
    assetHosts: assetHosts = { package: 'http://maxdome.de', store: 'http://store.maxdome.de' },
  } = {}) {
    this.apiHost = apiHost;
    this.apiKey = apiKey;
    this.appId = appId;
    this.assetHosts = assetHosts;
  }

  getPath(path) {
    if (path.includes('?')) {
      path += '&';
    } else {
      path += '?';
    }
    path += `apikey=${this.apiKey}&appid=${this.appId}`;
    return path;
  }

  getUrl(path, { session, version: version = 'v1' }) {
    let url = `${this.apiHost}/api/${version}/${path}`;
    if (session) {
      url = url.replace('%customerId%', session.customer.customerId);
    }
    return url;
  }

  getFrom() {
    const author = appPkg.author;
    if (typeof author === 'object') {
      return `${author.name} <${author.email}> (${author.url})`;
    }
    return author;
  }

  getUserAgent() {
    return `${appPkg.name} v${appPkg.version} via ${libPkg.name} v${libPkg.version}`;
  }

  getHeaders({ headers: headers = {}, session } = {}) {
    const defaultHeaders = {
      accept: 'application/json',
      client: 'mxd_store',
      clienttype: 'Webportal',
      'content-type': 'application/json',
      from: this.getFrom(),
      language: 'de_DE',
      'maxdome-origin': 'maxdome.de',
      platform: 'web',
      'user-agent': this.getUserAgent(),
    };
    if (session) {
      defaultHeaders['mxd-session'] = session.sessionId;
    }
    return Object.assign(defaultHeaders, headers);
  }

  async request(path, { body, headers, session, method, transform, version } = {}) {
    try {
      return await rp({
        body,
        headers: this.getHeaders({ headers, session }),
        json: true,
        method,
        transform,
        url: this.getUrl(this.getPath(path), { session, version }),
      });
    } catch (e) {
      throw new Error(e.error.message);
    }
  }

  async get(path, { body, headers, session, method: method = 'get', transform, version } = {}) {
    return this.request(path, { body, headers, session, method, transform, version });
  }

  async post(path, { body, headers, session, method: method = 'post', transform, version } = {}) {
    return this.request(path, { body, headers, session, method, transform, version });
  }

  async put(path, { body, headers, session, method: method = 'put', transform, version } = {}) {
    return this.request(path, { body, headers, session, method, transform, version });
  }

  async delete(path, { body, headers, session, method: method = 'delete', transform, version } = {}) {
    return this.request(path, { body, headers, session, method, transform, version });
  }
}

module.exports = Client;
