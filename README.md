[![Dependency Status](https://david-dm.org/dragonprojects/mxd-heimdall/status.svg)](https://david-dm.org/dragonprojects/mxd-heimdall)
[![devDependency Status](https://david-dm.org/dragonprojects/mxd-heimdall/dev-status.svg)](https://david-dm.org/dragonprojects/mxd-heimdall?type=dev)

# Installation

`npm i --save mxd-heimdall`


# Initialisation

```
const { Heimdall } = require('mxd-heimdall');

const heimdall = new Heimdall({ appid: '<appid>', apikey: '<apikey>' });
```

**Attention**: `mxd-heimdall` will use several information from the `package.json` and add them to the headers. This makes it easier to identify the source of the request in the logs of heimdall if there are issues.
The information which will be used:
* from: 
  * If the author is an object: `${author.name} <${author.email}> (${author.url})`
  * If not, the string will be used
* user-agent: `${appPkg.name} v${appPkg.version} via ${libPkg.name} v${libPkg.version}`


# Examples

## Get information for a specific asset by ID

```
const { Asset, AssetsQuery } = require('mxd-heimdall');

const assetId = <assetId>;
const query = new AssetsQuery(assetId);
const assets = await Asset.get(heimdall, query);
```


## Search assets by title and get the first 3 results

```
const { Asset, AssetsQuery } = require('mxd-heimdall');

const title = '<title>';
const query = (new AssetsQuery())
  .filter('contentTypeSeriesOrMovies')
  .filter('search', title)
  .query('pageSize', 3);
const assets = await Asset.get(heimdall, query);
```


## Get the 50 newest store movies

```
const { Asset, AssetsQuery } = require('mxd-heimdall');

const query = (new AssetsQuery())
  .filter('availableWithoutPackage')
  .filter('movies')
  .filter('new')
  .filter('notUnlisted')
  .query('pageSize', 50)
  .sort('activeLicenseStart', 'desc');
const assets = await Asset.get(heimdall, query);
```
