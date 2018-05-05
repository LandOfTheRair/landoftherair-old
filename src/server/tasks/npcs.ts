
const argv = require('minimist')(process.argv.slice(2));
require('dotenv').config({ silent: true, path: argv.prod ? '.env.prod' : '.env' });

import { DB } from '../database';

import * as YAML from 'yamljs';
import * as recurse from 'recursive-readdir';

import { includes, flatten, isNumber, size, extend, get, isString, isArray } from 'lodash';

import * as Effects from '../effects';

import { Stats, Skills } from '../../shared/models/character';

import { NPC } from '../../shared/models/npc';

import * as Classes from '../classes';

class NPCLoader {

  static async loadAllNPCs() {
    await DB.init();

    recurse(`${__dirname}/../../content/npcs`).then(async files => {
      const filePromises = files.map(file => {
        const npcs = YAML.load(file);

        const promises = npcs.map(npcData => {
          return new Promise((resolve, reject) => {
            NPCLoader.conditionallyAddInformation(npcData);
            NPCLoader.assignReputations(npcData);
            if(!NPCLoader.validateItem(npcData)) return reject(new Error(`${npcData.npcId} failed validation.`));
            return resolve(npcData);
          });
        });

        return promises;
      });

      try {
        const allNPCData = await Promise.all(flatten(filePromises));

        console.log('Validated all NPCs.');

        await DB.$npcs.remove({}, { multi: true });

        console.log('Removed old NPCs.');

        const allNPCDataPromises = allNPCData.map((npcData: any) => {
          return DB.$npcs.insert(npcData);
        });

        await Promise.all(flatten(allNPCDataPromises));

        console.log('Inserted all NPCs.');

      } catch(e) {
        console.error(e);
        process.exit(-1);
      }

      console.log('Done');
      process.exit(0);
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
      'Enemy': ['Royalty', 'Townsfolk', 'Adventurers', 'Wilderness', 'Underground', 'Pirates', 'None'],
      'NaturalResource': ['Enemy']
    };

    antiReps[npc.allegiance].forEach(antiRep => npc.allegianceReputation[antiRep] = -101);
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

    const validAttributes = ['physical', 'blunt', 'sharp', 'magical', 'necrotic', 'fire', 'ice', 'water', 'energy'];

    if(npc.baseEffects) {
      for(let i = 0; i < npc.baseEffects.length; i++) {
        const attr = npc.baseEffects[i];

        if(attr.name === 'Attribute') {
          if(!attr.effectData) {
            console.error(`ERROR: ${npc.npcId} has an invalid attribute - no effectData!`);
            return false;
          }

          if(!includes(validAttributes, attr.effectData.damageType)) {
            console.error(`ERROR: ${npc.npcId} has an invalid attribute damage type: ${attr.effectData.damageType}!`);
            return false;
          }

          if(!isNumber(attr.effectData.potency)) {
            console.error(`ERROR: ${npc.npcId} has an invalid non-numeric potency value for attribute ${attr.effectData.damageType}!`);
            return false;
          }
        } else {
          if(!Effects[attr.name]) {
            console.error(`ERROR: ${npc.npcId} has an invalid baseEffect: ${attr.name}!`);
            return false;
          }
        }
      }
    }

    const validMonsterClasses = ['Undead', 'Beast'];

    if(npc.monsterClass && !includes(validMonsterClasses, npc.monsterClass)) {
      console.error(`ERROR: ${npc.npcId} has an invalid monster class: ${npc.monsterClass}`);
      return false;
    }

    const validateKeys = [
      'rightHand', 'leftHand',
      'gear.Armor', 'gear.Robe1', 'gear.Robe2', 'gear.Feet', 'gear.Hands',
      'gear.Ring1', 'gear.Ring2', 'gear.Wrists', 'gear.Waist', 'gear.Ear',
      'gear.Head', 'gear.Neck',
      'copyDrops', 'drops'
    ];

    for(let i = 0; i < validateKeys.length; i++) {
      const val = get(npc, validateKeys[i]);

      // no val is fine
      if(!val) continue;

      // string val is fine
      if(isString(val)) continue;

      if(isArray(val)) {
        for(let v = 0; v < val.length; v++) {
          const currentCheckDrop = val[v];
          // string val is fine
          if(isString(currentCheckDrop)) continue;

          if(!currentCheckDrop.result && validateKeys[i] !== 'copyDrops') {
            console.error(`ERROR: ${npc.npcId} has an invalid drop config ${validateKeys[i]}[${v}] - no result!`);
            return false;
          }

          if(!currentCheckDrop.drop && validateKeys[i] === 'copyDrops') {
            console.error(`ERROR: ${npc.npcId} has an invalid drop config ${validateKeys[i]}[${v}] - no drop!`);
            return false;
          }

          if(!currentCheckDrop.chance) {
            console.error(`ERROR: ${npc.npcId} has an invalid drop config ${validateKeys[i]}[${v}] - no chance!`);
            return false;
          }
        }
      }
    }

    return true;

  }

}

NPCLoader.loadAllNPCs();
