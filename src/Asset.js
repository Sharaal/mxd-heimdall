const types = {
  assetVideoFilm: 'movie',
  assetVideoFilmTvSeries: 'episode',
  multiAssetTvSeriesSeason: 'season',
  multiAssetBundleTvSeries: 'series',
};

class Asset {
  constructor(asset, { assetHosts }) {
    const type = types[asset['@class']];

    let title = asset.title;
    if (type === 'season') {
      title += ` (Staffel ${asset.number})`;
    }

    let image;
    if (asset.coverList) {
      const poster = asset.coverList.filter(cover => cover.usageType === 'poster')[0];
      if (poster) {
        image = poster.url;
      }
    }

    const areas = [];
    let linkArea;
    if (asset.fullMarkingList.includes('inPremiumIncluded')) {
      areas.push('package');
      linkArea = 'package';
    } else {
      linkArea = 'store';
    }
    if (asset.mediaUsageList.includes('DTO') || asset.mediaUsageList.includes('TVOD')) {
      areas.push('store');
    }

    this.areas = areas;
    this.link = `${assetHosts[linkArea]}/${asset.id}`;
    this.type = type;
    this.id = asset.id;
    this.title = title;
    this.description = asset.descriptionShort;
    this.image = image;
    this.searchTitle = asset.title.replace(' (Hot from the US)', '');
    this.hotFromUS = asset.title.includes(' (Hot from the US)');
    this.episodeTitle = asset.episodeTitle;
    this.episodeNumber = asset.episodeNumber;
    this.seasonNumber = asset.seasonNumber || asset.number;
    this.countries = asset.countryList;
    this.duration = asset.duration;
    this.fskLevels = asset.fskLevelList;
    this.genres = asset.genreList
      .filter(genre => genre.genreType === 'genre')
      .map(genre => genre.value);
    this.productionYear = asset.productionYear;
    this.rating = asset.userrating;
    this.remembered = asset.remembered;
    this.seen = asset.seen;
  }

  static async getAll(client, assetsQuery, { headers, session } = {}) {
    return client.get(`mxd/assets?${assetsQuery}`, {
      headers,
      session,
      transform: data =>
        data.assetList.map(asset => new Asset(asset, { assetHosts: client.assetHosts })),
    });
  }
}

module.exports = Asset;
