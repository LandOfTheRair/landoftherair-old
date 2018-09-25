
import { LootTable } from 'lootastic';

import { sample, random, extend, isNumber, isString, pull, every, compact, some, get, isArray, includes } from 'lodash';
import { NPC } from '../../shared/models/npc';
import { Logger } from '../logger';
import { RandomlyShouts } from '../scripts/npc/common-responses';
import { LootHelper } from '../helpers/world/loot-helper';
import { Dangerous } from '../effects/special/Dangerous';
import * as Effects from '../effects';
import { GameWorld } from '../rooms/GameWorld';
import { StatName } from '../../shared/models/character';
import { RollerHelper } from '../../shared/helpers/roller-helper';
import { Currency } from '../helpers/world/holiday-helper';

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
  isDangerous = false;

  shouldStrip = false;
  stripRadius = 0;
  stripOnSpawner = true;
  stripX: number;
  stripY: number;
  shouldEatTier = 0;
  eliteTickCap = 50;

  $$slowTicks = 0;
  $$eliteTicks = 0;
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

    // analysis script
    if(!room) return;

    // if a room disables creature spawn, it wants them all to spawn at once
    if(room.disableCreatureSpawn) this.currentTick = 0;

    if(this.currentTick === 0) {
      this.spawnInitialNPCs();
    }
  }

  private async spawnInitialNPCs() {
    // if no initial spawn or if no players in range, do not spawn anything
    if(this.initialSpawn === 0) return;
    if(this.shouldSlowDown()) return;

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

      if(RollerHelper.XInOneHundred(itemName.chance)) return { name: itemName.name };
    }

    return { name: '' };
  }

  private async chooseItemFrom(choices: string[]|any[]) {
    if(!choices) return null;
    if(isString(choices)) return this.room.npcLoader.loadItem(choices);
    const itemChooser = new LootTable(choices);
    const item = itemChooser.chooseWithReplacement(1);

    if(item && item[0] && item[0] !== 'none') return this.room.npcLoader.loadItem(item[0]);
    return null;
  }

  private chooseSpriteFrom(choices): number {
    if(isNumber(choices)) return choices;
    if(!choices || choices.length === 0) return 0;
    return sample(choices);
  }

  async createNPC(opts: { npcId?: string, createCallback?: Function } = {}): Promise<NPC> {
    if((!this.npcIds || this.npcIds.length === 0) && !opts.npcId) {
      if(this.x !== 0 && this.y !== 0) {
        Logger.error(`No valid npcIds for spawner ${this.constructor.name} at ${this.x}, ${this.y} on ${this.map}`);
      }
      this.removeSelf();
      return;
    }

    const { npcId, createCallback } = opts;

    let chosenNPC = npcId;

    if(!chosenNPC) {
      if(this.npcIds.length === 1) {
        chosenNPC = this.npcIds[0];
      } else {
        const npcChooser = new LootTable(this.npcIds);
        chosenNPC = npcChooser.chooseWithReplacement(1)[0];
      }
    }

    const npcData = await this.room.npcLoader.loadNPCData(chosenNPC);

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
          Logger.error(new Error(`Could not load item ${JSON.stringify(npcData.gear[slot])} in slot ${slot} for ${npcData.name} (${npcData.npcId}).`));
        }
      }));
    }

    let sackItems = [];

    if(npcData.sack) {
      const items = await Promise.all(npcData.sack.map(async itemName => {

        const { name } = this.shouldLoadItem(itemName);
        if(!name) return null;

        try {
          return await this.room.npcLoader.loadItem(name);
        } catch(e) {
          Logger.error(new Error(`Could not load item ${name} for ${npcData.name}.`));
        }

      }));
      sackItems = compact(items);
    }

    let beltItems = [];

    if(npcData.belt && npcData.belt.length > 0) {
      const items = await Promise.all(npcData.belt.map(async itemName => {
        const { name } = this.shouldLoadItem(itemName);
        if(!name) return null;

        try {
          return await this.room.npcLoader.loadItem(name);
        } catch(e) {
          Logger.error(new Error(`Could not load item ${name} for ${npcData.name}.`));
        }

      }));
      beltItems = compact(items);
    }

    // spawn on any number of coordinates
    let foundCoordinates = { x: 0, y: 0 };

    let attempts = 0;

    while(!foundCoordinates.x || !foundCoordinates.y) {
      const x = random(this.x - this.spawnRadius, this.x + this.spawnRadius);
      const y = random(this.y - this.spawnRadius, this.y + this.spawnRadius);

      const isWall = this.room.state.checkIfActualWall(x, y);
      const hasDenseObject = this.room.state.checkIfDenseObject(x, y);
      const invalidLocation = x < 4 || y < 4 || x > this.room.mapWidth - 4 || y > this.room.mapHeight - 4;

      if(!isWall && !hasDenseObject && !invalidLocation) {
        foundCoordinates = { x, y };
      }

      if(attempts++ > 100) {
        Logger.error(new Error(`Could not place a creature at ${this.x}, ${this.y} - ${this.room.mapName}`));
        break;
      }
    }

    npcData.x = foundCoordinates.x;
    npcData.y = foundCoordinates.y;
    npcData.map = this.map;

    if(!npcData.name) {
      npcData.name = this.room.npcLoader.determineNPCName(npcData);
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

    if(npcData.sack && npcData.sack.length > 0) {
      const additionalSackItems = await LootHelper.rollSingleTableForEachItem((<any>npcData.sack), npc.$$room);
      sackItems.push(...additionalSackItems);
    }

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

    if(tick)          npc.$$ai.tick.add(tick.bind(aiInst));
    if(mechanicTick)  npc.$$ai.mechanicTick.add(mechanicTick.bind(aiInst));
    if(death)         npc.$$ai.death.add(death.bind(aiInst));
    if(damageTaken)   npc.$$ai.damageTaken.add(damageTaken.bind(aiInst));

    if(npc.combatMessages) {
      RandomlyShouts(npc, npc.combatMessages, { combatOnly: true });
    }

    npc.allegiance = npcData.allegiance;
    npc.alignment = npcData.alignment;
    npc.hostility = npcData.hostility;
    npc.spawner = this;
    npc.$$shouldStrip = this.shouldStrip;
    npc.$$shouldEatTier = this.shouldEatTier;
    npc.$$stripRadius = this.stripRadius;
    npc.$$stripOnSpawner = this.stripOnSpawner;
    npc.$$stripX = this.stripX;
    npc.$$stripY = this.stripY;

    if(this.isDangerous) {
      const dangerous = new Dangerous({});
      dangerous.cast(npc, npc);
    }

    if(npcData.baseEffects) {
      npcData.baseEffects.forEach(({ name, effectData }) => {
        const attr = new Effects[name](effectData);
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

    if(createCallback) {
      createCallback(npc);
    }

    npc.usableSkills = npc.usableSkills || [];

    if(!includes(npc.usableSkills, 'Charge')) {
      npc.usableSkills.push('Attack');
    }

    const mappedSkills = npc.usableSkills.map((x: any) => {
      if(x.result) return x;
      return { result: x, chance: 1 };
    });

    npc.$$skillRoller = new LootTable(mappedSkills, 0);

    npc.recalculateStats();
    this.tryElitify(npc);

    npc.hp.toMaximum();
    npc.mp.toMaximum();

    npc.$$room.state.calculateFOV(npc);
    this.addNPC(npc);

    return npc;
  }

  private tryElitify(npc: NPC) {
    if(npc.hostility === 'Never') return npc;

    if(this.eliteTickCap <= 0) return npc;

    this.$$eliteTicks++;
    if(this.$$eliteTicks < this.eliteTickCap) return npc;

    this.$$eliteTicks = 0;

    npc.name = `elite ${npc.name}`;

    Object.keys(npc.baseStats).forEach(stat => {
      npc.gainBaseStat(<StatName>stat, Math.round(npc.getBaseStat(<StatName>stat) / 3));
    });

    npc.level += Math.floor(npc.level / 10);
    npc.skillOnKill *= 4;
    npc.earnCurrency(Currency.Gold, npc.currentGold * 3);
    npc.giveXp.min *= 4;
    npc.giveXp.max *= 4;

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
      npc.fov = null;
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

  shouldSlowDown() {
    if(!this.canSlowDown) return false;
    return this.room.state.getAllPlayersInRange(this, this.leashRadius).length === 0;
  }

  npcTick(canMove: boolean, playerLocations: any): void {
    this.npcs.forEach(npc => {

      const oldPos = { x: npc.x, y: npc.y };

      const amINearAPlayer = get(playerLocations, [npc.x, npc.y]);
      if(!amINearAPlayer) {
        npc.fov = null;
      }

      if(npc.hostility === 'Never') {
        npc.tick(canMove, amINearAPlayer);
        return;
      }

      this.room.state.updateNPCVolatile(npc);

      // dead things always tick when the spawner is slow for normal-speed corpse rotting
      if(this.$$isStayingSlow) {
        if(npc.isDead()) {
          npc.tick(false, amINearAPlayer);
        }
        return;
      }

      npc.tick(canMove, amINearAPlayer);
      if(amINearAPlayer && (oldPos.x !== npc.x || oldPos.y !== npc.y)) npc.$$room.state.calculateFOV(npc);
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
