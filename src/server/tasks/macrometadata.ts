
require('dotenv').config({ silent: true });

import { includes } from 'lodash';

import * as fs from 'fs';
import * as recurse from 'recursive-readdir';

class MacroMetadataOrganizer {
  static organize() {
    recurse(`${__dirname}/../scripts/commands`).then(commands => {

      const allMeta = [];

      commands.forEach(command => {
        if(includes(command, 'index')) return;
        const cmd = require(command);
        const meta = cmd[Object.keys(cmd)[0]].macroMetadata;
        if(!meta.name) return;
        meta.isSystem = true;
        allMeta.push(meta);
      });

      fs.writeFileSync(`${__dirname}/../../client/app/macro-bars/macros.json`, JSON.stringify({ allMeta }, null, 4));

      process.exit(0);
    });
  }
}

MacroMetadataOrganizer.organize();
