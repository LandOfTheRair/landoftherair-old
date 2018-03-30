
import { flatten, random, set, get } from 'lodash';

import { Allegiance, Character, Direction } from './character';
import { Item } from './item';
import * as uuid from 'uuid/v4';
import { CharacterHelper } from '../../server/helpers/character/character-helper';
import { DeathHelper } from '../../server/helpers/character/death-helper';
import { Player } from './player';

export type Hostility = 'Never' | 'OnHit' | 'Faction' | 'Always';
export type MonsterClass = 'Undead' | 'Beast';

export class NPC extends Character {
  npcId: string;
  uuid: string;

  hostility: Hostility = 'OnHit';
  monsterClass?: MonsterClass;

  vendorItems: Item[];

  classTrain: string;
  trainSkills: string[] = [];
  maxSkillTrain: number;
  maxLevelUpLevel: number;

  script: string;
  parser: any;
  spawner?: any;
  path?: any[];

  bankId?: string;
  branchId?: string;

  alchOz?: number;
  alchCost?: number;

  costPerThousand?: number;
  repairsUpToCondition?: number;

  peddleDesc?: string;
  peddleItem?: string;
  peddleCost?: number;

  hpTier?: number;
  mpTier?: number;

  copyDrops: any[];
  drops: Item[];
  dropPool: { items: Item[], choose: { min: number, max: number }, replace?: boolean };
  giveXp: any;
  repMod: Array<{ delta: number, allegiance: Allegiance }>;

  usableSkills: string[];

  leashMessage: string;
  spawnMessage: string;
  combatMessages: string[];

  $$pathDisrupted: boolean;
  $$shouldStrip: boolean;
  $$stripRadius: number;
  $$stripOnSpawner: boolean;
  $$stripX: number;
  $$stripY: number;

  $$lastResponse: string;
  $$following: boolean;
  $$hadRightHandAtSpawn: boolean;
  private $$targetDamageDone = {};

  get dropsCorpse(): boolean {
    return !this.isNaturalResource;
  }

  init() {
    if(!this.uuid) this.uuid = uuid();
    this.initAI();
    this.initSack();
    this.initBelt();
    this.recalculateStats();

    this.$$hadRightHandAtSpawn = !!this.rightHand;
  }

  receiveMessage(player, message) {
    if(!this.parser) return;

    this.parser.setEnv('player', player);
    let output = this.parser.parse(message);
    if(!output || output === 'undefined') return;

    this.setDirRelativeTo(player);
    output = output.split('|||');
    output.forEach(outputMessage => {
      player.sendClientMessage({ name: this.name, message: outputMessage });
    });
  }

  setPath(path: string) {
    if(!path) return;
    this.path = flatten(path.split(' ').map(str => {
      const [numSteps, dir] = str.split('-');
      const coord = this.getXYFromDir(<Direction>dir);
      const ret = [];
      for(let i = 0; i < +numSteps; i++) {
        ret.push(coord);
      }
      return ret;
    }));
  }

  tick(canMove = false, playerLocations?) {
    super.tick();

    if(this.$$ai && this.$$ai.mechanicTick) {
      this.$$ai.mechanicTick.dispatch();
    }

    if(this.isInCombat) this.combatTicks--;

    if(this.isUnableToAct()) return;

    if(this.$$ai && this.$$ai.tick) {
      const actions = this.getTotalStat('actionSpeed');
      for(let i = 0; i < actions; i++) {
        this.$$ai.tick.dispatch(canMove, playerLocations);
      }
    }
  }

  isValidStep({ x, y }) {
    if(!this.spawner) return true;
    if(this.$$following) return true;
    if(this.spawner.randomWalkRadius > 0 && this.distFrom(this.spawner, { x, y }) > this.spawner.randomWalkRadius) return false;
    return true;
  }

  canDie() {
    return super.canDie() && this.hostility !== 'Never';
  }

  kill(dead) {
    if(this.$$owner) {
      this.$$owner.kill(dead, { isPetKill: true });
    }

    if(this.$$shouldStrip) {

      let stripPoint = this.spawner;

      if(dead.isPlayer()) {
        stripPoint = this.$$stripX && this.$$stripY ? { x: this.$$stripX, y: this.$$stripY } : this.spawner;
      }

      CharacterHelper.strip(dead, this.$$stripOnSpawner ? stripPoint : this, this.$$stripRadius);
    }
  }

  die(killer, silent = false) {
    super.die(killer, silent);

    if(silent) return;

    if(!this.spawner) return false;

    if(this.$$ai && this.$$ai.death) {
      this.$$ai.death.dispatch(killer);
    }

    if(killer) {

      const giveXp = this.giveXp || { min: 1, max: 10 };
      const givenXp = random(giveXp.min, giveXp.max);

      if(killer.$$owner) {
        killer.$$owner.gainExpFromKills(this.$$room.calcAdjustedXPGain(givenXp));
        return false;
      }

      if((<Player>killer).username) {
        this.repMod.forEach(({ allegiance, delta }) => {
          killer.changeRep(allegiance, delta);
        });

        killer.gainExpFromKills(this.$$room.calcAdjustedXPGain(givenXp));
      }

      DeathHelper.calculateLootDrops(this, killer);
    }
  }

  restore() {
    if(this.$$corpseRef) {

      if(this.$$corpseRef.$heldBy) {
        const holder = this.$$room.state.findPlayer(this.$$corpseRef.$heldBy);
        holder.sendClientMessage(`The corpse turned to dust in your hands.`);
        DeathHelper.corpseCheck(holder);
      }

      this.$$room.dropCorpseItems(this.$$corpseRef);
      this.$$room.removeItemFromGround(this.$$corpseRef);
    }

    if(this.spawner) {
      this.spawner.removeNPC(this);
    }
  }

  sendLeashMessage() {
    if(!this.leashMessage) return;
    this.sendClientMessageToRadius(`You hear ${this.leashMessage}.`, 8);
  }

  sendSpawnMessage() {
    if(!this.spawnMessage) return;
    this.sendClientMessageToRadius(`You hear ${this.spawnMessage}.`, 8);
  }

  setRightHand(item: Item) {
    super.setRightHand(item);
    this.$$room.syncNPC(this);
  }

  setLeftHand(item: Item) {
    super.setLeftHand(item);
    this.$$room.syncNPC(this);
  }

  registerAttackDamage(char: Character, attack: string, damage: number) {
    this.$$targetDamageDone = this.$$targetDamageDone || {};
    set(this, ['$$targetDamageDone', char.uuid, attack, 'lastDamage'], damage);

    this.registerZeroTimes(char, attack, damage > 0);
  }

  getAttackDamage(char: Character, attack: string) {
    return get(this, ['$$targetDamageDone', char.uuid, attack, 'lastDamage'], -1);
  }

  registerZeroTimes(char: Character, attack: string, overrideValue?: boolean) {
    this.$$targetDamageDone = this.$$targetDamageDone || {};
    const times = get(this, ['$$targetDamageDone', char.uuid, attack, 'zeroTimes'], 0);
    set(this, ['$$targetDamageDone', char.uuid, attack, 'zeroTimes'], overrideValue ? 0 : times + 1);
  }

  getZeroTimes(char: Character, attack: string) {
    this.$$targetDamageDone = this.$$targetDamageDone || {};
    return get(this, ['$$targetDamageDone', char.uuid, attack, 'zeroTimes'], 0);
  }
}
