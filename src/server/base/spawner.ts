
import { NPCLoader } from '../helpers/npc-loader';

import { sample, random, extend, isNumber, isString } from 'lodash';
import { NPC } from '../../models/npc';
import { Logger } from '../logger';

export class Spawner {

  x: number;
  y: number;
  map: number;

  currentTick = 0;

  // in ticks
  respawnRate = 3600;

  initialSpawn = 0;

  maxCreatures = 5;

  // TODO -1 to spawn anywhere in map
  spawnRadius = 0;

  randomWalkRadius = 10;

  // TODO -1 to disable
  leashRadius = 20;

  paths: string[];

  npcIds: string[];

  npcAISettings: string[];

  npcs: NPC[] = [];

  constructor(private room, { x, y, map }, spawnOpts) {
    extend(this, spawnOpts);

    this.x = x / 64;
    this.y = y / 64;
    this.map = map;

    for(let i = 0; i < this.initialSpawn; i++) {
      this.createNPC();
    }
  }

  isActive() {
    return true;
  }

  private async chooseItemFrom(choices: string[]) {
    if(isString(choices)) return NPCLoader.loadItem(choices);
    const item = sample(choices);
    if(item) return NPCLoader.loadItem(item);
    return null;
  }

  private chooseSpriteFrom(choices): number {
    if(isNumber(choices)) return choices;
    if(!choices || choices.length === 0) return 0;
    return sample(choices);
  }

  async createNPC() {
    if(!this.npcIds || this.npcIds.length === 0) {
      Logger.error(`No valid npcIds for spawner ${this.constructor.name} at ${this.x}, ${this.y} on ${this.map}`);
      return;
    }

    const npcData = await NPCLoader.loadNPCData(sample(this.npcIds));
    if(!npcData) {
      Logger.error(`No valid spawn for spawner ${this.constructor.name} at ${this.x}, ${this.y} on ${this.map}`);
      return;
    }

    npcData.sprite = this.chooseSpriteFrom(npcData.sprite);

    npcData.rightHand = await this.chooseItemFrom(npcData.rightHand);
    npcData.leftHand = await this.chooseItemFrom(npcData.leftHand);

    if(npcData.gear) {
      await Promise.all(Object.keys(npcData.gear).map(async slot => {
        const item = await this.chooseItemFrom(npcData.gear[slot]);
        npcData.gear[slot] = item;
        return item;
      }));
    }

    if(npcData.sack) {
      npcData.sack = await Promise.all(npcData.sack.map(async itemName => {
        return await NPCLoader.loadItem(itemName);
      }));
    }

    if(npcData.belt) {
      npcData.belt = await Promise.all(npcData.belt.map(async itemName => {
        return await NPCLoader.loadItem(itemName);
      }));
    }

    npcData.x = random(this.x - this.spawnRadius, this.x + this.spawnRadius);
    npcData.y = random(this.y - this.spawnRadius, this.y + this.spawnRadius);
    npcData.map = this.map;

    const ai = sample(this.npcAISettings) || 'default';
    npcData.ai = require(`../scripts/ai/${ai}`);

    if(!npcData.name) {
      npcData.name = this.room.determineNPCName(npcData);
    }

    if(npcData.gold) {
      npcData.gold = random(npcData.gold.min, npcData.gold.max);
    }

    if(npcData.hp) {
      const hp = random(npcData.hp.min, npcData.hp.max);
      npcData.hp = { minimum: 0, maximum: hp, __current: hp };
    }

    if(npcData.mp) {
      const mp = random(npcData.mp.min, npcData.mp.max);
      npcData.mp = { minimum: 0, maximum: mp, __current: mp };
    }

    const npc = new NPC(npcData);

    npc.drops = npcData.drops;
    npc.hostility = npcData.hostility;
    npc.spawner = this;
    this.assignPath(npc);
    this.addNPC(npc);
    npc.recalculateStats();

    return npc;
  }

  addNPC(npc: NPC) {
    this.npcs.push(npc);
    this.room.state.addNPC(npc);
  }

  assignPath(npc: NPC) {
    if(!this.paths || this.paths.length === 0) return false;
    npc.setPath(sample(this.paths));
  }

  tick() {
    if(!this.isActive()) return;

    this.currentTick++;
    if(this.currentTick > this.respawnRate && this.npcs.length < this.maxCreatures) {
      this.currentTick = 0;
      this.createNPC();
    }
  }

  npcTick() {
    this.npcs.forEach(npc => npc.tick());
  }

}
