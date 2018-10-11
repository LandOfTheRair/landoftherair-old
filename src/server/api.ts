
import * as express from 'express';
import * as cors from 'cors';
import * as bodyParser from 'body-parser';
import * as RateLimit from 'express-rate-limit';
import * as staticFile from 'connect-static-file';
import * as processStats from 'process-stats';

import { DB } from './database';

import { drawNormal as drawNormalArmor } from './tasks/analysis/_armor';
import { drawNormal as drawNormalWeapon, drawSpecial as drawSpecialWeapon } from './tasks/analysis/_weapons';
import { drawPremium } from './tasks/analysis/_premium';
import { drawCsv } from './tasks/analysis/item-to-csv';

const PAGE_SIZE = 50;

export class GameAPI {

  public expressApp: any;

  constructor() {
    const app = express();
    app.use(cors());
    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(bodyParser.json());

    this.addDebugRoutes(app);
    this.addAuthRoutes(app);
    this.addGameRoutes(app);

    this.expressApp = app;
  }

  private addDebugRoutes(app) {
    app.use('/debug/logs', async (req, res) => {
      const dbLogs = await DB.$logs.find().toArray();
      res.json(dbLogs);
    });

    app.use('/debug/server', (req, res) => {
      res.json(processStats());
    });

    app.use('/debug/item-stats', async (req, res) => {
      const statStrings = await Promise.all([drawNormalArmor(), drawNormalWeapon(), drawSpecialWeapon()]);
      res.send(statStrings.map(x => `<pre>${x}</pre>`).join(''));
    });

    app.use('/debug/item-csv', async (req, res) => {
      const itemStrings = await drawCsv();
      res.send(itemStrings.map(x => `<pre>${x.join(',')}</pre>`).join(''));
    });

    app.use('/debug/premium-stats', async (req, res) => {
      const premium = await drawPremium();
      res.send(`<pre>${premium}</pre>`);
    });
  }

  private addAuthRoutes(app) {
    app.use('/silent-dev', staticFile(`${__dirname}/silent-dev.html`));

    app.use('/silent-production', staticFile(`${__dirname}/silent-production.html`));
  }

  private addGameRoutes(app) {
    app.use('/maps', express.static(require('path').join(__dirname, 'maps')));

    const limiter = new RateLimit({
      windowMs: 5 * 1000,
      max: 5,
      delayMs: 0
    });

    app.use('/api/', limiter);

    app.use('/api/market/all', async (req, res) => {
      const items = await this.searchMarketboard(req.body);
      res.json(items);
    });

    app.use('/api/market/mine', async (req, res) => {
      const items = await this.myMarketboardListings(req.body);
      res.json(items);
    });

    app.use('/api/market/pickups', async (req, res) => {
      const items = await this.myMarketboardPickups(req.body);
      res.json(items);
    });
  }

  private async searchMarketboard(opts: any = {}) {

    const page = +(opts.page || 0);
    const sort = opts.sort || { 'listingInfo.listedAt': -1 };
    const filter = opts.filter || [];

    const query: any = {};

    if(opts.search && opts.search.itemId) {
      const { itemId } = opts.search;
      query.itemId = new RegExp(itemId, 'i');
    }

    if(filter.length > 0) {
      query['itemInfo.itemClass'] = { $in: filter };
    }

    return DB.$marketListings
      .find(query)
      .sort(sort)
      .skip(page * PAGE_SIZE)
      .limit(PAGE_SIZE)
      .toArray();
  }

  private async myMarketboardListings(opts: any = {}) {

    // const page = +(opts.page || 0);
    const sort = opts.sort || { 'listingInfo.listedAt': -1 };

    return DB.$marketListings
      .find({ 'listingInfo.seller': opts.username })
      .sort(sort)
      // .skip(page * PAGE_SIZE)
      // .limit(PAGE_SIZE)
      .toArray();
  }

  private async myMarketboardPickups(opts: any = {}) {
    return DB.$marketPickups
      .findOne({ username: opts.username });
  }
}
