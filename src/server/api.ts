
import * as express from 'express';
import * as cors from 'cors';
import * as staticFile from 'connect-static-file';
import * as processStats from 'process-stats';

import { DB } from './database';

import { drawNormal as drawNormalArmor } from './tasks/analysis/_armor';
import { drawNormal as drawNormalWeapon, drawSpecial as drawSpecialWeapon } from './tasks/analysis/_weapons';

export class GameAPI {

  public expressApp: any;

  constructor() {
    const app = express();
    app.use(cors());

    app.use('/logs', async (req, res) => {
      const dbLogs = await DB.$logs.find().toArray();
      res.json(dbLogs);
    });

    app.use('/server', (req, res) => {
      res.json(processStats());
    });

    app.use('/item-stats', async (req, res) => {
      const statStrings = await Promise.all([drawNormalArmor(), drawNormalWeapon(), drawSpecialWeapon()]);
      res.send(statStrings.map(x => `<pre>${x}</pre>`).join(''));
    });

    app.use('/silent-dev', staticFile(`${__dirname}/silent-dev.html`));

    app.use('/silent-production', staticFile(`${__dirname}/silent-production.html`));

    app.use('/maps', express.static(require('path').join(__dirname, 'maps')));

    this.expressApp = app;
  }
}
