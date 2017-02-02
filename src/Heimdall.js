const fs = require('fs');
const rp = require('request-promise');

const Asset = require('./Asset');
const AssetsQuery = require('./AssetsQuery');
const Maxpert = require('./Maxpert');

const appPkg = JSON.parse(fs.readFileSync(`${process.cwd()}/package.json`));
const libPkg = JSON.parse(fs.readFileSync(`${__dirname}/../package.json`));

class Heimdall {
  constructor({
    apikey: apikey = process.env.HEIMDALL_APIKEY,
    appid: appid = process.env.HEIMDALL_APPID,
    apiHostname: apiHostname = 'heimdall.maxdome.de',
    assetHostnames: assetHostnames = { package: 'maxdome.de', store: 'store.maxdome.de' },
    version: version = 'v1',
  } = {}) {
    this.apikey = apikey;
    this.appid = appid;
    this.apiHostname = apiHostname;
    this.assetHostnames = assetHostnames;
    this.version = version;
  }

  getPath(path = '') {
    let add = '';
    if (path.includes('?')) {
      add += '&';
    } else {
      add += '?';
    }
    add += `apikey=${this.apikey}&appid=${this.appid}`;
    return path + add;
  }

  getUrl(path = '', version) {
    return `https://${this.apiHostname}/api/${version || this.version}/${path}`;
  }

  static getFrom() {
    let author = appPkg.author;
    if (typeof author === 'object') {
      author = `${author.name} <${author.email}> (${author.url})`;
    }
    return author;
  }

  static getUserAgent() {
    return `${appPkg.name} v${appPkg.version} via ${libPkg.name} v${libPkg.version}`;
  }

  static getHeaders(headers = {}) {
    return Object.assign(
      {
        accept: 'application/json',
        client: 'mxd_store',
        clienttype: 'Webportal',
        'content-type': 'application/json',
        from: Heimdall.getFrom(),
        language: 'de_DE',
        'maxdome-origin': 'maxdome.de',
        platform: 'web',
        'user-agent': Heimdall.getUserAgent(),
      },
      headers,
    );
  }

  async request(path = '', { body, headers, method: method = 'get', transform } = {}) {
    try {
      return await rp({
        body,
        headers: Heimdall.getHeaders(headers),
        json: true,
        method,
        transform,
        url: this.getUrl(this.getPath(path)),
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
      transform: data =>
        data.assetList.map(asset => new Asset(asset, { assetHostnames: this.assetHostnames })),
    });
  }

  async getTipOfTheDay({ headers } = {}) {
    const page = await this.get('pages/%2F', {
      headers: Object.assign(
        {
          client: 'mxd_package',
          clienttype: 'samsung_tv',
          platform: 'ott',
        },
        headers,
      ),
    });
    const componentId = page.components.container
      .filter(component => component.layout === 'tip-of-the-day')[0].container[0].meta_id;

    const component = await this.get(`components/${componentId}`);
    const tipOfTheDay = component.list[0];

    const published = new Date(tipOfTheDay.published);
    const assetId = tipOfTheDay.review[0].mam_asset_id[0].id;
    const asset = (await this.getAssets(new AssetsQuery(assetId)))[0];
    const maxpert = new Maxpert(tipOfTheDay.review[0].maxpert[0]);

    return { published, asset, maxpert };
  }
}

module.exports = Heimdall;
