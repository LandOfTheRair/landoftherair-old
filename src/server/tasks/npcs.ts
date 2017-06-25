
import { Stats } from '../../models/character';
require('dotenv').config({ silent: true });

import { DB } from '../database';

import * as YAML from 'yamljs';
import * as recurse from 'recursive-readdir';

import { includes, flatten, isUndefined, isNumber } from 'lodash';

import { NPC } from '../../models/npc';

class NPCLoader {

  static loadAllNPCs() {
    DB.isReady.then(async () => {
      await DB.$npcs.remove({}, { multi: true });

      recurse(`${__dirname}/../data/npcs`).then(files => {
        const filePromises = files.map(file => {
          const npcs = YAML.load(file);

          const promises = npcs.map(npcData => {
            this.conditionallyAddInformation(npcData);
            if(!this.validateItem(npcData)) return;

            console.log(`Inserting ${npcData.npcId}`);
            return DB.$npcs.insert(npcData);
          });

          return promises;
        });

        Promise.all(flatten(filePromises)).then(() => {
          console.log('Done');
          process.exit(0);
        });
      });
    });
  }

  static conditionallyAddInformation(npc: NPC) {
    if(!npc.allegiance) npc.allegiance = 'Enemy';

    if(!npc.usableSkills) npc.usableSkills = [];

    if(!npc.skillOnKill) npc.skillOnKill = 1;

    npc.usableSkills.push('Attack');

    // TODO skill levels shortcut to set skill levels

    if(!npc.level) npc.level = 1;

    if(isNumber(npc.stats)) {
      const statValue: number = <any>npc.stats;

      npc.stats = new Stats();
      ['str', 'agi', 'dex', 'int', 'wis', 'wil', 'con', 'luk', 'cha'].forEach(stat => {
        npc.stats[stat] = statValue;
      });
    }
  }

  static validateItem(npc: any): boolean {
    if(!npc.npcId) { console.error(`ERROR: ${JSON.stringify(npc)} has no npcId!`); return false; }
    return true;

  }

}

NPCLoader.loadAllNPCs();
