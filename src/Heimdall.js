import fs from 'fs';
import rp from 'request-promise';

const appPkg = JSON.parse(fs.readFileSync(`${process.cwd()}/package.json`));
const libPkg = JSON.parse(fs.readFileSync(`${__dirname}/../package.json`));

class Heimdall {
  constructor({ apikey, appid, hostname: hostname = 'heimdall.maxdome.de', version: version = 'v1' }) {
    this.apikey = apikey;
    this.appid = appid;
    this.hostname = hostname;
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
    return `https://${this.hostname}/api/${version || this.version}/${path}`;
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
      headers
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
      transform: data => data.assetList.map((asset) => {
        let title = asset.title;
        if (asset['@class'] === 'MultiAssetTvSeriesSeason') {
          title += ` (Season ${asset.number})`;
        }
        let image;
        if (asset.coverList) {
          const poster = asset.coverList.filter(cover => cover.usageType === 'poster')[0];
          if (poster) {
            image = poster.url.replace('__WIDTH__', 138).replace('__HEIGHT__', 200);
          }
        }
        return {
          id: asset.id,
          title,
          description: asset.descriptionShort,
          image,
          remembered: asset.remembered,
        };
      }),
    });
  }
}

export default Heimdall;
