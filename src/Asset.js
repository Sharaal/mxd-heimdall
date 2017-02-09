class Asset {
  constructor(asset, { assetHosts }) {
    this.id = asset.id;

    this.type = {
      assetVideoFilm: 'movie',
      assetVideoFilmTvSeries: 'episode',
      multiAssetTvSeriesSeason: 'season',
      multiAssetBundleTvSeries: 'series',
    }[asset['@class']];

    this.title = asset.title;
    if (this.type === 'season') {
      this.title += ` (Staffel ${asset.number})`;
    }
    this.searchTitle = asset.title.replace(' (Hot from the US)', '');
    this.hotFromUS = asset.title.includes(' (Hot from the US)');
    this.episodeTitle = asset.episodeTitle;
    this.episodeNumber = asset.episodeNumber;
    this.seasonNumber = asset.seasonNumber || asset.number;

    this.description = asset.descriptionShort;

    if (asset.coverList) {
      const poster = asset.coverList.filter(cover => cover.usageType === 'poster')[0];
      if (poster) {
        this.image = poster.url;
      }
    }

    this.areas = [];
    if (asset.fullMarkingList.includes('inPremiumIncluded')) {
      this.areas.push('package');
    }
    if (asset.mediaUsageList.includes('DTO') || asset.mediaUsageList.includes('TVOD')) {
      this.areas.push('store');
    }

    this.link = `${assetHosts[this.areas.includes('package') ? 'package' : 'store']}/${asset.id}`;

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
