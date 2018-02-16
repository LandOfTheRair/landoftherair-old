
import { NPCLoader } from '../helpers/npc-loader';
import { LootTable } from 'lootastic';

import { sample, random, extend, isNumber, isString, pull, min, every, compact, some, isArray } from 'lodash';
import { NPC } from '../../shared/models/npc';
import { Logger } from '../logger';
import { RandomlyShouts } from '../scripts/npc/common-responses';
import { LootHelper } from '../helpers/loot-helper';

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

  removeWhenNoNPCs = false;
  npcCreateCallback: Function;

  constructor(private room, { x, y, map }, spawnOpts) {
    extend(this, spawnOpts);

    this.x = x;
    this.y = y;
    this.map = map;

    // if a room disables creature spawn, it wants them all to spawn at once
    if(room.disableCreatureSpawn) this.currentTick = 0;

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

  async createNPC(): Promise<void> {
    if(!this.npcIds || this.npcIds.length === 0) {
      if(this.x !== 0 && this.y !== 0) {
        Logger.error(`No valid npcIds for spawner ${this.constructor.name} at ${this.x}, ${this.y} on ${this.map}`);
      }
      this.removeSelf();
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

    // prevent loading a left hand if your right hand requires 2h
    if(!npcData.rightHand || (npcData.rightHand && !npcData.rightHand.twoHanded)) {
      npcData.leftHand = await this.chooseItemFrom(npcData.leftHand);
    } else {
      npcData.leftHand = null;
    }

    if(npcData.gear) {
      await Promise.all(Object.keys(npcData.gear).map(async slot => {
        try {
          const item = await this.chooseItemFrom(npcData.gear[slot]);
          npcData.gear[slot] = item;
          return item;
        } catch(e) {
          Logger.error(new Error(`Could not load item in ${slot} for ${npcData.name}.`));
        }
      }));
    }

    let sackItems = [];

    if(npcData.sack) {
      const items = await Promise.all(npcData.sack.map(async itemName => {

        const { name } = this.shouldLoadItem(itemName);
        if(!name) return null;

        try {
          return await NPCLoader.loadItem(name);
        } catch(e) {
          Logger.error(new Error(`Could not load item ${name} for ${npcData.name}.`));
        }

      }));
      sackItems = compact(items);
    }

    let beltItems = [];

    if(npcData.belt) {
      const items = await Promise.all(npcData.belt.map(async itemName => {
        const { name } = this.shouldLoadItem(itemName);
        if(!name) return null;

        try {
          return await NPCLoader.loadItem(name);
        } catch(e) {
          Logger.error(new Error(`Could not load item ${name} for ${npcData.name}.`));
        }

      }));
      beltItems = compact(items);
    }

    npcData.x = random(this.x - this.spawnRadius, this.x + this.spawnRadius);
    npcData.y = random(this.y - this.spawnRadius, this.y + this.spawnRadius);
    npcData.map = this.map;

    if(!npcData.name) {
      npcData.name = NPCLoader.determineNPCName(npcData);
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
    npc.$$room = this.room;

    const additionalSackItems = await LootHelper.getAllLoot(npc, 0, true);
    sackItems.push(...additionalSackItems);

    beltItems.forEach(item => npc.belt.addItem(item));
    sackItems.forEach(item => npc.sack.addItem(item));

    let ai = 'default';
    if(this.npcAISettings) {
      let aiSettings: any = this.npcAISettings;
      if(!isArray(aiSettings)) aiSettings = [aiSettings];
      ai = sample(aiSettings);
    }

    const { tick, death, damage } = require(`../scripts/ai/${ai}`);
    if(tick) npc.$$ai.tick.add(tick);
    if(death) npc.$$ai.death.add(death);
    if(damage) npc.$$ai.damage.add(damage);

    if(npc.combatMessages) {
      RandomlyShouts(npc, npc.combatMessages, { combatOnly: true });
    }

    npc.allegiance = npcData.allegiance;
    npc.alignment = npcData.alignment;
    npc.hostility = npcData.hostility;
    npc.spawner = this;
    npc.$$shouldStrip = this.shouldStrip;
    npc.$$stripRadius = this.stripRadius;
    npc.$$stripOnSpawner = this.stripOnSpawner;
    npc.$$stripX = this.stripX;
    npc.$$stripY = this.stripY;

    npc.tryToCastEquippedEffects();

    npc.sendSpawnMessage();

    this.assignPath(npc);

    // post-creation processing
    if(this.npcCreateCallback) {
      this.npcCreateCallback(npc);
    }

    npc.recalculateStats();

    npc.hp.toMaximum();
    npc.mp.toMaximum();
    this.addNPC(npc);
  }

  addNPC(npc: NPC) {
    this.npcs.push(npc);
    this.room.addNPC(npc);
  }

  removeNPC(npc: NPC) {
    pull(this.npcs, npc);
    this.room.removeNPC(npc);
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
      this.$$slowTicks = 2;
      this.$$isStayingSlow = true;
    } else {
      this.$$isStayingSlow = false;
    }

    if(this.currentTick > this.respawnRate
    && this.respawnRate > 0
    && this.npcs.length < this.maxCreatures
    && (this.alwaysSpawn || (this.room.canSpawnCreatures && !this.$$isStayingSlow))) {
      this.currentTick = 0;
      this.createNPC();
    }
  }

  npcTick(canMove: boolean) {
    this.npcs.forEach(npc => {
      if(npc.hostility === 'Never') {
        npc.tick(canMove);
        return;
      }

      if(this.$$isStayingSlow) {
        if(npc.isDead()) {
          npc.tick();
        }
        return;
      }

      npc.tick(canMove);
      npc.$$room.state.calculateFOV(npc);
    });
  }

  public hasAnyAlive(): boolean {
    return some(this.npcs, npc => npc.hp.getValue() > 0);
  }

  private removeSelf() {
    this.room.removeSpawner(this);
  }

}
