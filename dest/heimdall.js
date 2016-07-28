'use strict';

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { return step("next", value); }, function (err) { return step("throw", err); }); } } return step("next"); }); }; }

const rp = require('request-promise');

module.exports = _ref => {
  let apikey = _ref.apikey;
  let appid = _ref.appid;
  let pageSize = _ref.pageSize;
  return (() => {
    var _ref2 = _asyncToGenerator(function* (query) {
      query.query('apikey', apikey).query('appid', appid);
      if (pageSize) {
        query.query('pageSize', pageSize);
      }
      return rp.get({
        url: `https://heimdall.maxdome.de/interfacemanager-2.1/mxd/assets?${ query }`,
        headers: {
          accept: 'application/json',
          clienttype: 'Webportal',
          'maxdome-origin': 'de'
        },
        json: true,
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
    });

    return function (_x) {
      return _ref2.apply(this, arguments);
    };
  })();
};