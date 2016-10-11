'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _requestPromise = require('request-promise');

var _requestPromise2 = _interopRequireDefault(_requestPromise);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { return step("next", value); }, function (err) { return step("throw", err); }); } } return step("next"); }); }; }

const appPkg = JSON.parse(_fs2.default.readFileSync(`${ process.cwd() }/package.json`));
const libPkg = JSON.parse(_fs2.default.readFileSync(`${ __dirname }/../package.json`));

class Heimdall {
  constructor(_ref) {
    let apikey = _ref.apikey;
    let appid = _ref.appid;
    var _ref$hostname = _ref.hostname;
    let hostname = _ref$hostname === undefined ? 'heimdall.maxdome.de' : _ref$hostname;
    let pageSize = _ref.pageSize;
    var _ref$version = _ref.version;
    let version = _ref$version === undefined ? 'v1' : _ref$version;

    this.apikey = apikey;
    this.appid = appid;
    this.hostname = hostname;
    this.pageSize = pageSize;
    this.version = version;
  }

  getPath() {
    let path = arguments.length <= 0 || arguments[0] === undefined ? '' : arguments[0];

    let add = '';
    if (path.includes('?')) {
      add += '&';
    } else {
      add += '?';
    }
    add += `apikey=${ this.apikey }&appid=${ this.appid }`;
    return path + add;
  }

  getUrl() {
    let path = arguments.length <= 0 || arguments[0] === undefined ? '' : arguments[0];

    return `https://${ this.hostname }/api/${ this.version }/${ path }`;
  }

  static getFrom() {
    let author = appPkg.author;
    if (typeof author === 'object') {
      author = `${ author.name } <${ author.email }> (${ author.url })`;
    }
    return author;
  }

  static getUserAgent() {
    return `${ appPkg.name } v${ appPkg.version } via ${ libPkg.name } v${ libPkg.version }`;
  }

  static getHeaders() {
    let headers = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

    return Object.assign({
      accept: 'application/json',
      client: 'mxd_store',
      clienttype: 'Webportal',
      'content-type': 'application/json',
      from: Heimdall.getFrom(),
      language: 'de_DE',
      'maxdome-origin': 'maxdome.de',
      platform: 'web',
      'user-agent': Heimdall.getUserAgent()
    }, headers);
  }

  request() {
    var _this = this;

    let path = arguments.length <= 0 || arguments[0] === undefined ? '' : arguments[0];

    var _ref2 = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    let body = _ref2.body;
    let headers = _ref2.headers;
    var _ref2$method = _ref2.method;
    let method = _ref2$method === undefined ? 'get' : _ref2$method;
    let transform = _ref2.transform;
    return _asyncToGenerator(function* () {
      try {
        return yield (0, _requestPromise2.default)({
          body: body,
          headers: Heimdall.getHeaders(headers),
          json: true,
          method: method,
          transform: transform,
          url: _this.getUrl(_this.getPath(path))
        });
      } catch (e) {
        throw new Error(e.error.message);
      }
    })();
  }

  get() {
    var _this2 = this;

    let path = arguments.length <= 0 || arguments[0] === undefined ? '' : arguments[0];

    var _ref3 = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    let body = _ref3.body;
    let headers = _ref3.headers;
    let transform = _ref3.transform;
    return _asyncToGenerator(function* () {
      return _this2.request(path, { body: body, headers: headers, transform: transform });
    })();
  }

  post() {
    var _this3 = this;

    let path = arguments.length <= 0 || arguments[0] === undefined ? '' : arguments[0];

    var _ref4 = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    let body = _ref4.body;
    let headers = _ref4.headers;
    let transform = _ref4.transform;
    return _asyncToGenerator(function* () {
      return _this3.request(path, { body: body, headers: headers, method: 'post', transform: transform });
    })();
  }

  put() {
    var _this4 = this;

    let path = arguments.length <= 0 || arguments[0] === undefined ? '' : arguments[0];

    var _ref5 = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    let body = _ref5.body;
    let headers = _ref5.headers;
    let transform = _ref5.transform;
    return _asyncToGenerator(function* () {
      return _this4.request(path, { body: body, headers: headers, method: 'put', transform: transform });
    })();
  }

  delete() {
    var _this5 = this;

    let path = arguments.length <= 0 || arguments[0] === undefined ? '' : arguments[0];

    var _ref6 = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    let body = _ref6.body;
    let headers = _ref6.headers;
    let transform = _ref6.transform;
    return _asyncToGenerator(function* () {
      return _this5.request(path, { body: body, headers: headers, method: 'delete', transform: transform });
    })();
  }

  getAssets(query) {
    var _this6 = this;

    var _ref7 = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    let headers = _ref7.headers;
    return _asyncToGenerator(function* () {
      return _this6.get(`mxd/assets?${ query }`, {
        headers: headers,
        transform: function transform(data) {
          return data.assetList.map(function (asset) {
            let title = asset.title;
            if (asset['@class'] === 'MultiAssetTvSeriesSeason') {
              title += ` (Season ${ asset.number })`;
            }
            let image;
            if (asset.coverList) {
              const poster = asset.coverList.filter(function (cover) {
                return cover.usageType === 'poster';
              })[0];
              if (poster) {
                image = poster.url.replace('__WIDTH__', 138).replace('__HEIGHT__', 200);
              }
            }
            return {
              id: asset.id,
              title: title,
              description: asset.descriptionShort,
              image: image,
              remembered: asset.remembered
            };
          });
        }
      });
    })();
  }
}

exports.default = Heimdall;