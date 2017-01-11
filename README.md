[![Dependency Status](https://david-dm.org/dragonprojects/mxd-heimdall.svg)](https://david-dm.org/dragonprojects/mxd-heimdall)
[![devDependency Status](https://david-dm.org/dragonprojects/mxd-heimdall/dev-status.svg)](https://david-dm.org/dragonprojects/mxd-heimdall?type=dev)

# Installation

`npm i --save mxd-heimdall`


# Initialisation

```
const { AssetsQuery, Heimdall } = require('mxd-heimdall');

const heimdall = new Heimdall({ appid: '<appid>', apikey: '<apikey>' });
```

**Attention**: `mxd-heimdall` will use several information from the `package.json` and add them to the headers. This makes it easier to identify the source of the request in the logs of heimdall if there are issues.
The information which will be used:
* from: `${author.name} <${author.email}> (${author.url})`
* user-agent: `${appPkg.name} v${appPkg.version} via ${libPkg.name} v${libPkg.version}`


# Examples

## Get information for a specific asset by ID

```
const query = new AssetsQuery(1);
const assets = await heimdall.getAssets(query);
```


## Search assets by title and get the first 3 results

```
const title = '<title>';
const query = (new AssetsQuery())
  .filter('contentTypeSeriesOrMovies')
  .filter('search', title)
  .query('pageSize', 3);
const assets = await heimdall.getAssets(query);
```


## Get the 50 newest store movies

```
const query = (new AssetsQuery())
  .filter('availableWithoutPackage')
  .filter('movies')
  .filter('new')
  .filter('notUnlisted')
  .query('pageSize', 50)
  .sort('activeLicenseStart', 'desc');
const assets = await heimdall.getAssets(query);
```

