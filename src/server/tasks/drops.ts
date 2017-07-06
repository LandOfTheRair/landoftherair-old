const argv = require('minimist')(process.argv.slice(2));
require('dotenv').config({ silent: true, path: argv.prod ? '.env.prod' : '.env' });

import { DB } from '../database';

import * as YAML from 'yamljs';
import * as recurse from 'recursive-readdir';
import * as path from 'path';

import { includes, flatten, isUndefined, isNumber } from 'lodash';

class DropsLoader {

  static loadAllRegions() {
    DB.isReady.then(async () => {
      await DB.$regionDrops.remove({}, { multi: true });

      recurse(`${__dirname}/../data/droptables/regions`).then(files => {
        const filePromises = files.map(file => {
          const droptable = YAML.load(file);
          const fileName = path.basename(file, path.extname(file));
          console.log(`Inserting Region ${fileName}`);

          return DB.$regionDrops.insert({
            regionName: fileName,
            drops: droptable
          });
        });

        Promise.all(flatten(filePromises)).then(() => {
          console.log('Done');
          process.exit(0);
        });
      });
    });
  }

  static loadAllMaps() {
    DB.isReady.then(async () => {
      await DB.$mapDrops.remove({}, { multi: true });

      recurse(`${__dirname}/../data/droptables/maps`).then(files => {
        const filePromises = files.map(file => {
          const droptable = YAML.load(file);
          const fileName = path.basename(file, path.extname(file));
          console.log(`Inserting Map ${fileName}`);

          return DB.$mapDrops.insert({
            mapName: fileName,
            drops: droptable
          });
        });

        Promise.all(flatten(filePromises)).then(() => {
          console.log('Done');
          process.exit(0);
        });
      });
    });
  }

}

DropsLoader.loadAllRegions();
DropsLoader.loadAllMaps();
