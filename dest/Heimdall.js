'use strict';

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { return step("next", value); }, function (err) { return step("throw", err); }); } } return step("next"); }); }; }

const rp = require('request-promise');

const appPkg = require(`${ process.cwd() }/package.json`);
const libPkg = require('../package.json');

module.exports = class {
  constructor(_ref) {
    let apikey = _ref.apikey;
    let appid = _ref.appid;
    let hostname = _ref.hostname;
    let pageSize = _ref.pageSize;
    let version = _ref.version;

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
    path += `apikey=${ this.apikey }&appid=${ this.appid }`;
    return path;
  }

  getUrl(path) {
    return `https://${ this.hostname }/api/${ this.version }/${ path }`;
  }

  getFrom() {
    let author = appPkg.author;
    if (author) {
      if (typeof author === 'object') {
        author = `${ author.name } <${ author.email }> (${ author.url })`;
      }
      return author;
    }
  }

  getUserAgent() {
    return `${ appPkg.name } v${ appPkg.version } via ${ libPkg.name } v${ libPkg.version }`;
  }

  getHeaders(headers) {
    return Object.assign({
      accept: 'application/json',
      client: 'mxd_store',
      clienttype: 'Webportal',
      'content-type': 'application/json',
      from: this.getFrom(),
      language: 'de_DE',
      'maxdome-origin': 'maxdome.de',
      platform: 'web',
      'user-agent': this.getUserAgent()
    }, headers || {});
  }

  request(path, _ref2) {
    var _this = this;

    let body = _ref2.body;
    let headers = _ref2.headers;
    let method = _ref2.method;
    let transform = _ref2.transform;
    return _asyncToGenerator(function* () {
      try {
        return yield rp({
          body: body,
          method: method || 'get',
          url: _this.getUrl(_this.getPath(path)),
          headers: _this.getHeaders(headers),
          json: true,
          transform: transform
        });
      } catch (e) {
        throw new Error(e.error.message);
      }
    })();
  }

  get(path, _ref3) {
    var _this2 = this;

    let body = _ref3.body;
    let headers = _ref3.headers;
    let transform = _ref3.transform;
    return _asyncToGenerator(function* () {
      return _this2.request(path, { body: body, headers: headers, transform: transform });
    })();
  }

  post(path, _ref4) {
    var _this3 = this;

    let body = _ref4.body;
    let headers = _ref4.headers;
    let transform = _ref4.transform;
    return _asyncToGenerator(function* () {
      return _this3.request(path, { body: body, headers: headers, method: 'post', transform: transform });
    })();
  }

  put(path, _ref5) {
    var _this4 = this;

    let body = _ref5.body;
    let headers = _ref5.headers;
    let transform = _ref5.transform;
    return _asyncToGenerator(function* () {
      return _this4.request(path, { body: body, headers: headers, method: 'put', transform: transform });
    })();
  }

  delete(path, _ref6) {
    var _this5 = this;

    let body = _ref6.body;
    let headers = _ref6.headers;
    let transform = _ref6.transform;
    return _asyncToGenerator(function* () {
      return _this5.request(path, { body: body, headers: headers, method: 'delete', transform: transform });
    })();
  }

  getAssets(query) {
    var _this6 = this;

    return _asyncToGenerator(function* () {
      return _this6.get(`mxd/assets?${ query }`, {
        transform: function transform(data) {
          return data.assetList.map(function (asset) {
            let title = asset.title;
            if (asset['@class'] === 'MultiAssetTvSeriesSeason') {
              title += ` (Season ${ asset.number })`;
            }
            return { id: asset.id, title: title, description: asset.descriptionShort };
          });
        }
      });
    })();
  }
};