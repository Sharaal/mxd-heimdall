'use strict';

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { return step("next", value); }, function (err) { return step("throw", err); }); } } return step("next"); }); }; }

const rp = require('request-promise');

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

  getHeaders(headers) {
    return Object.assign({
      accept: 'application/json',
      client: 'mxd_package',
      clienttype: 'Webportal',
      'content-type': 'application/json',
      language: 'de_DE',
      'maxdome-origin': 'maxdome.de',
      platform: 'web'
    }, headers || {});
  }

  getUrl(path) {
    return `https://${ this.hostname }/api/${ this.version }/${ path }`;
  }

  request(path, _ref2) {
    var _this = this;

    let body = _ref2.body;
    let headers = _ref2.headers;
    let method = _ref2.method;
    let transform = _ref2.transform;
    return _asyncToGenerator(function* () {
      return rp({
        body: body,
        method: method || 'get',
        url: _this.getUrl(_this.getPath(path)),
        headers: _this.getHeaders(headers),
        json: true,
        transform: transform
      });
    })();
  }

  getAssets(query) {
    var _this2 = this;

    return _asyncToGenerator(function* () {
      return _this2.request(`mxd/assets?${ query }`, {
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