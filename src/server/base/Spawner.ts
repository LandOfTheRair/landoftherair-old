
import { NPCLoader } from '../helpers/npc-loader';
import { LootTable } from 'lootastic';

import { sample, random, extend, isNumber, isString, pull, min, every, compact, some } from 'lodash';
import { NPC } from '../../shared/models/npc';
import { Logger } from '../logger';
import { RandomlyShouts } from '../scripts/npc/common-responses';

export class Spawner {

  x: number;
  y: number;
  map: string;

  currentTick = 0;

  // in half-seconds
  respawnRate = 240;

  initialSpawn = 0;

  maxCreatures = 5;

  spawnRadius = 0;

  randomWalkRadius = 10;

  leashRadius = 20;

  paths: string[];

  npcIds: string[]|any[];

  npcAISettings: string[];

  npcs: NPC[] = [];

  alwaysSpawn: boolean;

  shouldSerialize: boolean;

  requireDeadToRespawn = false;

  canSlowDown = true;

  shouldStrip = false;
  stripRadius = 0;
  stripOnSpawner = true;
  stripX: number;
  stripY: number;

  $$slowTicks = 0;

  $$isStayingSlow = false;

  constructor(private room, { x, y, map }, spawnOpts) {
    extend(this, spawnOpts);

    this.x = x;
    this.y = y;
    this.map = map;

    if(this.currentTick === 0) {
      for(let i = 0; i < this.initialSpawn; i++) {
        this.createNPC();
      }
    }
  }

  isActive() {
    return true;
  }

  private shouldLoadItem(itemName: string|any) {
    if(isString(itemName)) return { name: itemName };

    if(itemName.chance && itemName.name) {
      if(itemName.chance < 0) return { name: itemName.name };

      if(random(0, 100) <= itemName.chance) return { name: itemName.name };
    }

    return { name: '' };
  }

  private async chooseItemFrom(choices: string[]|any[]) {
    if(!choices) return null;
    if(isString(choices)) return NPCLoader.loadItem(choices);
    const itemChooser = new LootTable(choices);
    const item = itemChooser.chooseWithReplacement(1);

    if(item && item[0] && item[0] !== 'none') return NPCLoader.loadItem(item[0]);
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

    const npcChooser = new LootTable(this.npcIds);
    const chosenNPC = npcChooser.chooseWithReplacement(1)[0];

    const npcData = await NPCLoader.loadNPCData(chosenNPC);

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

    let sackItems = [];

    if(npcData.sack) {
      const items = await Promise.all(npcData.sack.map(async itemName => {

        const { name } = this.shouldLoadItem(itemName);
        if(!name) return null;
        return await NPCLoader.loadItem(name);
      }));
      sackItems = compact(items);
    }

    let beltItems = [];

    if(npcData.belt) {
      const items = await Promise.all(npcData.belt.map(async itemName => {
        const { name } = this.shouldLoadItem(itemName);
        if(!name) return null;
        return await NPCLoader.loadItem(name);
      }));
      beltItems = compact(items);
    }

    npcData.x = random(this.x - this.spawnRadius, this.x + this.spawnRadius);
    npcData.y = random(this.y - this.spawnRadius, this.y + this.spawnRadius);
    npcData.map = this.map;

    if(!npcData.name) {
      npcData.name = this.room.determineNPCName(npcData);
    }

    if(npcData.gold) {
      npcData.gold = random(npcData.gold.min, npcData.gold.max);
    }

    if(npcData.hp) {
      const hp = random(npcData.hp.min, npcData.hp.max);
      npcData.stats.hp = hp;
    }

    if(npcData.mp) {
      const mp = random(npcData.mp.min, npcData.mp.max);
      npcData.stats.mp = mp;
    }

    const npc = new NPC(npcData);

    const additionalSackItems = await this.room.getAllLoot(npc, 0, true);
    sackItems.push(...additionalSackItems);

    beltItems.forEach(item => npc.belt.addItem(item));
    sackItems.forEach(item => npc.sack.addItem(item));

    const ai = sample(this.npcAISettings) || 'default';
    const { tick } = require(`../scripts/ai/${ai}`);
    if(tick) npc.$$ai.tick.add(tick);

    if(npc.combatMessages) {
      RandomlyShouts(npc, npc.combatMessages);
    }

    npc.allegiance = npcData.allegiance;
    npc.alignment = npcData.alignment;
    npc.hostility = npcData.hostility;
    npc.spawner = this;
    npc.$$room = this.room;
    npc.$$shouldStrip = this.shouldStrip;
    npc.$$stripRadius = this.stripRadius;
    npc.$$stripOnSpawner = this.stripOnSpawner;
    npc.$$stripX = this.stripX;
    npc.$$stripY = this.stripY;

    npc.sendSpawnMessage();

    this.assignPath(npc);
    this.addNPC(npc);
    npc.recalculateStats();

    npc.hp.toMaximum();
    npc.mp.toMaximum();

    return npc;
  }

  addNPC(npc: NPC) {
    this.npcs.push(npc);
    this.room.state.addNPC(npc);
  }

  removeNPC(npc: NPC) {
    pull(this.npcs, npc);
    this.room.state.removeNPC(npc);
  }

  assignPath(npc: NPC) {
    if(!this.paths || this.paths.length === 0) return false;
    npc.setPath(sample(this.paths));
  }

  getDistsForPlayers() {
    return this.room.state.players.map(x => x.distFrom(this));
  }

  shouldSlowDown(dists) {
    if(!this.canSlowDown) return false;
    return dists.length > 0 && min(dists) > Math.max(this.leashRadius, 30);
  }

  tick() {
    if(!this.isActive()) return;

    if(this.requireDeadToRespawn) {
      if(this.npcs.length === 0 || every(this.npcs, npc => npc.isDead())) this.currentTick++;
    } else {
      this.currentTick++;
    }

    if(this.$$slowTicks > 0) {
      this.$$slowTicks--;
      return;
    }

    if(this.shouldSlowDown(this.getDistsForPlayers())) {
      this.$$slowTicks = 4;
      this.$$isStayingSlow = true;
    } else {
      this.$$isStayingSlow = false;
    }

    if(this.currentTick > this.respawnRate
    && this.respawnRate > 0
    && this.npcs.length < this.maxCreatures
    && (this.alwaysSpawn || this.room.canSpawnCreatures)) {
      this.currentTick = 0;
      this.createNPC();
    }
  }

  npcTick() {
    this.npcs.forEach(npc => {
      npc.tick();

      if(npc.hostility === 'Never') return;

      if(!this.$$isStayingSlow) {
        npc.$$room.state.calculateFOV(npc);
      }
    });
  }

  public hasAnyAlive(): boolean {
    return some(this.npcs, npc => npc.hp.getValue() > 0);
  }

}
