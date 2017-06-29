
import { Stats, Skills } from '../../models/character';
require('dotenv').config({ silent: true });

import { DB } from '../database';

import * as YAML from 'yamljs';
import * as recurse from 'recursive-readdir';

import { includes, flatten, isUndefined, isNumber, size } from 'lodash';

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
            this.assignReputations(npcData);
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

  static assignReputations(npc: NPC) {
    npc.allegianceReputation = npc.allegianceReputation || {};
    if(size(npc.allegianceReputation) > 0) return;

    const antiReps = {
      'None': ['Enemy'],
      'Royalty': ['Townsfolk', 'Enemy'],
      'Townsfolk': ['Pirates', 'Royalty', 'Enemy'],
      'Adventurers': ['Pirates', 'Enemy'],
      'Wilderness': ['Underground', 'Enemy'],
      'Underground': ['Wilderness', 'Enemy'],
      'Pirates': ['Adventurers', 'Townsfolk', 'Enemy'],
      'Enemy': ['Royalty', 'Townsfolk', 'Adventurers', 'Wilderness', 'Underground', 'Pirates']
    };

    antiReps[npc.allegiance].forEach(antiRep => npc.allegianceReputation[antiRep] = -1);
  }

  static skillXPFromLevel(level: number) {
    return Math.pow(2, level) * 100;
  }

  static conditionallyAddInformation(npc: NPC) {
    if(!npc.allegiance) npc.allegiance = 'Enemy';

    if(!npc.usableSkills) npc.usableSkills = [];

    if(!npc.skillOnKill) npc.skillOnKill = 1;

    if(!npc.repMod) npc.repMod = 1;

    npc.usableSkills.push('Attack');

    if(!npc.level) npc.level = 1;

    const skillLevels = (<any>npc).skillLevels || {};
    const skillSet = new Skills();

    if(isNumber(skillLevels)) {
      Object.keys(skillSet).forEach(skill => {
        skillSet[skill.toLowerCase()] = this.skillXPFromLevel(skillLevels);
      });
    } else {
      Object.keys(skillLevels).forEach(skill => {
        skillSet[skill.toLowerCase()] = this.skillXPFromLevel(skillLevels[skill]);
      });
    }

    (<any>npc).skills = skillSet;
    delete (<any>npc).skillLevels;

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
