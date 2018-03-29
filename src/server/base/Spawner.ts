
import { NPCLoader } from '../helpers/character/npc-loader';
import { LootTable } from 'lootastic';

import { sample, random, extend, isNumber, isString, pull, every, compact, some, isArray } from 'lodash';
import { NPC } from '../../shared/models/npc';
import { Logger } from '../logger';
import { RandomlyShouts } from '../scripts/npc/common-responses';
import { LootHelper } from '../helpers/world/loot-helper';
import { Dangerous } from '../effects/special/Dangerous';
import { Attribute } from '../effects/augments/Attribute';
import { GameWorld } from '../rooms/GameWorld';

export class Spawner {

  x: number;
  y: number;
  map: string;
  name: string;

  currentTick = 0;

  // in seconds
  respawnRate = 120;

  initialSpawn = 0;

  maxCreatures = 5;

  spawnRadius = 0;

  randomWalkRadius = 10;

  leashRadius = 20;

  paths: string[];

  npcIds: string[]|any[];

  npcAISettings: string[];

  npcs: NPC[] = [];

  private despawnedNPCs: NPC[] = [];

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
  shouldBeActive = true;

  constructor(private room: GameWorld, { x, y, map, name }, spawnOpts) {
    extend(this, spawnOpts);

    this.x = x;
    this.y = y;
    this.map = map;
    this.name = name;

    // if a room disables creature spawn, it wants them all to spawn at once
    if(room.disableCreatureSpawn) this.currentTick = 0;

    if(this.currentTick === 0) {
      this.spawnInitialNPCs();
    }
  }

  private async spawnInitialNPCs() {
    if(this.initialSpawn === 0) return;

    // allow it to get into the cache
    await this.createNPC();

    const spawnAfter = this.initialSpawn - 1;
    if(spawnAfter > 0) {
      for(let i = 0; i < spawnAfter; i++) {
        this.createNPC();
      }
    }
  }

  isActive() {
    return this.shouldBeActive;
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

  async createNPC(): Promise<NPC> {
    if(!this.npcIds || this.npcIds.length === 0) {
      if(this.x !== 0 && this.y !== 0) {
        Logger.error(`No valid npcIds for spawner ${this.constructor.name} at ${this.x}, ${this.y} on ${this.map}`);
      }
      this.removeSelf();
      return;
    }

    let chosenNPC = '';
    if(this.npcIds.length === 1) {
      chosenNPC = this.npcIds[0];
    } else {
      const npcChooser = new LootTable(this.npcIds);
      chosenNPC = npcChooser.chooseWithReplacement(1)[0];
    }

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

    // spawn on any number of coordinates
    let foundCoordinates = { x: 0, y: 0 };

    while(!foundCoordinates.x || !foundCoordinates.y) {
      const x = random(this.x - this.spawnRadius, this.x + this.spawnRadius);
      const y = random(this.y - this.spawnRadius, this.y + this.spawnRadius);

      const isWall = this.room.state.checkIfActualWall(x, y);
      const hasDenseObject = this.room.state.checkIfDenseObject(x, y);
      const invalidLocation = x < 4 || y < 4 || x > this.room.mapWidth - 4 || y > this.room.mapHeight - 4;

      if(!isWall && !hasDenseObject && !invalidLocation) {
        foundCoordinates = { x, y };
      }
    }

    npcData.x = foundCoordinates.x;
    npcData.y = foundCoordinates.y;
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

    const aiScript = require(`../scripts/ai/${ai}`);
    const aiProto = aiScript[Object.keys(aiScript)[0]];

    const aiInst = new aiProto(npc);
    const { tick, mechanicTick, death, damageTaken } = aiInst;

    if(tick) npc.$$ai.tick.add(tick.bind(aiInst));
    if(mechanicTick) npc.$$ai.mechanicTick.add(mechanicTick.bind(aiInst));
    if(death) npc.$$ai.death.add(death.bind(aiInst));
    if(damageTaken) npc.$$ai.damageTaken.add(damageTaken.bind(aiInst));

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

    if(npc.$$shouldStrip) {
      const dangerous = new Dangerous({});
      dangerous.cast(npc, npc);
    }

    if(npcData.attributes) {
      npcData.attributes.forEach(attrInfo => {
        const attr = new Attribute(attrInfo);
        attr.cast(npc, npc);
      });
    }

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

    return npc;
  }

  addNPC(npc: NPC, doIncrement = true) {
    this.npcs.push(npc);
    this.room.addNPC(npc);
    if(doIncrement) this.room.totalCreaturesInWorld++;
  }

  removeNPC(npc: NPC, doDecrement = true) {
    pull(this.npcs, npc);
    this.room.removeNPC(npc);
    if(doDecrement) this.room.totalCreaturesInWorld--;
  }

  assignPath(npc: NPC) {
    if(!this.paths || this.paths.length === 0) return false;
    npc.setPath(sample(this.paths));
  }

  shouldSlowDown() {
    if(!this.canSlowDown) return false;
    return this.room.state.getAllPlayersInRange(this, Math.max(this.leashRadius, 20)).length === 0;
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

    // check if we're currently slow
    const isSlow = this.$$isStayingSlow;
    const shouldSlowDown = this.shouldSlowDown();

    // if we aren't already slow, and we should slow down
    if(!isSlow && shouldSlowDown) {
      this.$$slowTicks = 2;
      this.slowDown();

    // if we need to speed up, we speed up
    } else if(isSlow && !shouldSlowDown) {
      this.speedUp();
    }

    // npcs cannot spawn unless X ticks have passed, the spawner isn't overloaded, and they _always_ spawn OR they're not slow, _and_ the room isn't full
    if(this.currentTick > this.respawnRate
    && this.respawnRate > 0
    && (this.npcs.length + this.despawnedNPCs.length) < this.maxCreatures
    && (this.alwaysSpawn || (this.room.canSpawnCreatures && !this.$$isStayingSlow))) {
      this.currentTick = 0;
      this.createNPC();
    }
  }

  slowDown() {
    this.$$isStayingSlow = true;

    this.npcs.forEach(npc => {
      if(npc.isDead()) return;
      this.despawnedNPCs.push(npc);
      this.removeNPC(npc, false);
    });
  }

  speedUp() {
    this.$$isStayingSlow = false;

    this.despawnedNPCs.forEach(npc => {
      this.addNPC(npc, false);
    });

    this.despawnedNPCs = [];
  }

  npcTick(canMove: boolean): void {
    this.npcs.forEach(npc => {
      if(npc.hostility === 'Never') {
        npc.tick(canMove);
        return;
      }

      // dead things always tick when the spawner is slow for normal-speed corpse rotting
      if(this.$$isStayingSlow) {
        if(npc.isDead()) {
          npc.tick();
        }
        return;
      }

      npc.tick(canMove);
      npc.$$room.state.calculateFOV(npc);
      this.room.state.updateNPCVolatile(npc);
    });
  }

  buffTick(): void {
    if(this.$$isStayingSlow) return;

    this.npcs.forEach(npc => {
      npc.tickEffects();
    });
  }

  public hasAnyAlive(): boolean {
    return some(this.npcs, npc => npc.hp.total > 0);
  }

  private removeSelf() {
    this.room.removeSpawner(this);
  }

}
