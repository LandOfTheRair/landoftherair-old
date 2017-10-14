"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const argv = require('minimist')(process.argv.slice(2));
require('dotenv').config({ silent: true, path: argv.prod ? '.env.prod' : '.env' });
const database_1 = require("../database");
const YAML = require("yamljs");
const recurse = require("recursive-readdir");
const lodash_1 = require("lodash");
const character_1 = require("../../models/character");
const Classes = require("../classes");
class NPCLoader {
    static loadAllNPCs() {
        return __awaiter(this, void 0, void 0, function* () {
            yield database_1.DB.isReady;
            yield database_1.DB.$npcs.remove({}, { multi: true });
            recurse(`${__dirname}/../data/npcs`).then(files => {
                const filePromises = files.map(file => {
                    const npcs = YAML.load(file);
                    const promises = npcs.map(npcData => {
                        this.conditionallyAddInformation(npcData);
                        this.assignReputations(npcData);
                        if (!this.validateItem(npcData))
                            return;
                        console.log(`Inserting ${npcData.npcId}`);
                        return database_1.DB.$npcs.insert(npcData);
                    });
                    return promises;
                });
                Promise.all(lodash_1.flatten(filePromises)).then(() => {
                    console.log('Done');
                    process.exit(0);
                });
            });
        });
    }
    static assignReputations(npc) {
        npc.allegianceReputation = npc.allegianceReputation || {};
        if (lodash_1.size(npc.allegianceReputation) > 0)
            return;
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
    static skillXPFromLevel(level) {
        return Math.pow(2, level) * 100;
    }
    static conditionallyAddInformation(npc) {
        if (!npc.allegiance)
            npc.allegiance = 'Enemy';
        if (!npc.usableSkills)
            npc.usableSkills = [];
        if (!npc.skillOnKill)
            npc.skillOnKill = 1;
        if (!npc.repMod)
            npc.repMod = 1;
        npc.usableSkills.push('Attack');
        if (!npc.level)
            npc.level = 1;
        const skillLevels = npc.skillLevels || {};
        const skillSet = new character_1.Skills();
        if (lodash_1.isNumber(skillLevels)) {
            Object.keys(skillSet).forEach(skill => {
                skillSet[skill.toLowerCase()] = this.skillXPFromLevel(skillLevels);
            });
        }
        else {
            Object.keys(skillLevels).forEach(skill => {
                skillSet[skill.toLowerCase()] = this.skillXPFromLevel(skillLevels[skill]);
            });
        }
        npc.skills = skillSet;
        delete npc.skillLevels;
        if (lodash_1.isNumber(npc.stats)) {
            const statValue = npc.stats;
            npc.stats = new character_1.Stats();
            ['str', 'agi', 'dex', 'int', 'wis', 'wil', 'con', 'luk', 'cha'].forEach(stat => {
                npc.stats[stat] = statValue;
            });
        }
        if (npc.otherStats) {
            lodash_1.extend(npc.stats, npc.otherStats);
            delete npc.otherStats;
        }
    }
    static validateItem(npc) {
        if (!npc.npcId) {
            console.error(`ERROR: ${JSON.stringify(npc)} has no npcId!`);
            return false;
        }
        if (npc.baseClass && !Classes[npc.baseClass]) {
            console.error(`ERROR: ${npc.npcId} has an invalid baseClass ${npc.baseClass}!`);
            return false;
        }
        return true;
    }
}
NPCLoader.loadAllNPCs();
//# sourceMappingURL=npcs.js.map