const Asset = require('./Asset');
const AssetsQuery = require('./AssetsQuery');
const Maxpert = require('./Maxpert');

class TipOfTheDay {
  constructor(tipOfTheDay) {
    this.published = tipOfTheDay.published;
    this.asset = tipOfTheDay.asset;
    this.maxpert = tipOfTheDay.maxpert;
  }

  static async get(client, { headers, session } = {}) {
    const page = await client.get('pages/%2F', {
      headers: Object.assign(
        {
          client: 'mxd_package',
          clienttype: 'samsung_tv',
          platform: 'ott',
        },
        headers,
      ),
      session,
    });
    const componentId = page.components.container
      .filter(component => component.layout === 'tip-of-the-day')[0].container[0].meta_id;

    const component = await client.get(`components/${componentId}`, { headers, session });
    const tipOfTheDay = component.list[0];

    const published = new Date(tipOfTheDay.published);
    const assetId = tipOfTheDay.review[0].mam_asset_id[0].id;
    const asset = (await Asset.getAll(client, new AssetsQuery(assetId)), { headers, session })[0];
    const maxpert = new Maxpert(tipOfTheDay.review[0].maxpert[0]);

    return new TipOfTheDay({ published, asset, maxpert });
  }
}

module.exports = TipOfTheDay;
