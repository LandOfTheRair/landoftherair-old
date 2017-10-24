
const argv = require('minimist')(process.argv.slice(2));
require('dotenv').config({ silent: true, path: argv.prod ? '.env.prod' : '.env' });

import { DB } from '../database';

import * as YAML from 'yamljs';
import * as recurse from 'recursive-readdir';

import { includes, flatten, isUndefined, isNumber, size, extend } from 'lodash';

import { Stats, Skills } from '../../shared/models/character';

import { NPC } from '../../shared/models/npc';

import * as Classes from '../classes';

class NPCLoader {

  static async loadAllNPCs() {
    await DB.isReady;
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
    if(level === 0) return 100;
    if(level === 1) return 200;

    return Math.floor(Math.pow(1.55, level) * 100);
  }

  static conditionallyAddInformation(npc: any) {
    if(!npc.allegiance) npc.allegiance = 'Enemy';

    if(!npc.usableSkills) npc.usableSkills = [];

    if(!npc.skillOnKill) npc.skillOnKill = 1;

    if(!npc.repMod) npc.repMod = [];

    if(npc.allegiance !== 'None') {
      npc.repMod.push({ delta: -1, allegiance: npc.allegiance });
    }

    if(!includes(npc.usableSkills, 'Charge')) {
      npc.usableSkills.push('Attack');
    }

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

    if(npc.otherStats) {
      extend(npc.stats, npc.otherStats);
      delete npc.otherStats;
    }
  }

  static validateItem(npc: any): boolean {
    if(!npc.npcId) { console.error(`ERROR: ${JSON.stringify(npc)} has no npcId!`); return false; }
    if(npc.baseClass && !Classes[npc.baseClass]) { console.error(`ERROR: ${npc.npcId} has an invalid baseClass ${npc.baseClass}!`); return false; }
    return true;

  }

}

NPCLoader.loadAllNPCs();
