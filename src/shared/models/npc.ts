import { flatten, get, random, sample, set, includes } from 'lodash';

import { Character } from './character';
import * as uuid from 'uuid/v4';
import { CharacterHelper } from '../../server/helpers/character/character-helper';
import { DeathHelper } from '../../server/helpers/character/death-helper';
import { Player } from './player';
import { Currency } from '../interfaces/holiday';
import { RollerHelper } from '../helpers/roller-helper';
import { Allegiance, Direction, Hostility, INPC } from '../interfaces/character';
import { IItem } from '../interfaces/item';

export class NPC extends Character implements INPC {
  npcId: string;
  uuid: string;

  hostility: Hostility = 'OnHit';

  vendorItems?: IItem[];

  classTrain?: string;
  trainSkills?: string[] = [];
  maxSkillTrain?: number;
  maxLevelUpLevel?: number;

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
  drops: any[];
  dropPool: { items: IItem[], choose: { min: number, max: number }, replace?: boolean };
  giveXp: { min: number, max: number };
  repMod: Array<{ delta: number, allegiance: Allegiance }>;

  traitLevels: any;

  usableSkills: string[];

  leashMessage: string;
  sfx: string;
  sfxMaxChance: number;
  spawnMessage: string;
  combatMessages: string[];

  onlyVisibleTo?: string;

  $$skillRoller: any;
  $$pathDisrupted: { x: number, y: number };
  $$shouldStrip: boolean;
  $$stripRadius: number;
  $$stripOnSpawner: boolean;
  $$stripX: number;
  $$stripY: number;
  $$shouldEatTier: number;
  $$vendorCurrency: Currency;

  $$lastResponse: string;
  $$following: boolean;
  $$hadRightHandAtSpawn: boolean;

  $$stanceCooldown: number;
  private $$targetDamageDone = {};

  noCorpseDrop?: boolean;
  noItemDrop?: boolean;

  get dropsCorpse(): boolean {
    return !this.isNaturalResource && !this.noCorpseDrop;
  }

  get isElite(): boolean {
    return includes(this.name, 'elite');
  }

  init() {
    if(!this.uuid) this.uuid = uuid();
    if(!this.npcId) this.npcId = this.name;
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

    if(message === 'hello') player.$$statistics.addNpcGreet();

    this.setDirRelativeTo(player);
    this.$$room.state.updateNPCVolatile(this);

    if(!output || output === 'undefined') {

      const questionMessages = [
        'Hmm?',
        'What do you mean?',
        'Hello, are you looking for me?',
        'What do you want with me?',
        'Did you mean to say something else?',
        'What did you just call me?',
        'Can you get to the point of the matter?',
        'I\'m very busy, can you hurry it up?',
        'Can you be more clear?'
      ];

      player.sendClientMessage({ name: this.name, message: sample(questionMessages), grouping: 'chatter', subClass: 'chatter' });
      return;

    } else {
      this.$$room.analyticsHelper.trackNPCChat(player, this, message);
    }

    output = output.split('|||');
    output.forEach(outputMessage => {
      player.sendClientMessage({ name: this.name, message: outputMessage, grouping: 'chatter', subClass: 'chatter' });
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

  tick(canMove = false, amINearAPlayer?) {
    super.tick();

    if(this.isDead()) return;

    if(this.$$ai && this.$$ai.mechanicTick) {
      this.$$ai.mechanicTick.dispatch();
    }

    if(this.isInCombat) this.combatTicks--;

    if(this.isUnableToAct()) return;

    if(this.$$ai && this.$$ai.tick) {
      const actions = this.getTotalStat('actionSpeed');
      for(let i = 0; i < actions; i++) {
        this.$$ai.tick.dispatch(canMove, amINearAPlayer);
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
      return;
    }

    if(this.$$shouldStrip) {

      let stripPoint = this.spawner;

      if(dead.isPlayer()) {
        stripPoint = this.$$stripX && this.$$stripY ? { x: this.$$stripX, y: this.$$stripY } : this.spawner;
      }

      CharacterHelper.strip(dead, this.$$stripOnSpawner ? stripPoint : this, this.$$stripRadius);
    }

    if(this.$$shouldEatTier > 0) {
      dead.sendClientMessage(`${this.name} made a feast of you!`);
      dead.restore();

      const lostXP = Math.floor((dead.calcLevelXP(dead.level) / 40) * this.$$shouldEatTier);
      const lostSkill = Math.floor(500 * this.$$shouldEatTier);

      dead.loseBaseStat('hp', Math.floor(this.$$shouldEatTier));

      dead.loseExpOrSkill({ lostXPMin: lostXP, lostXPMax: lostXP, lostSkillMin: lostSkill, lostSkillMax: lostSkill });
    }
  }

  async die(killer, silent = false) {
    if(this.$$deathTicks > 0) return;

    super.die(killer, silent);

    this.$$room.dispatchEvent('kill:npc', { npc: this, killer });

    if(silent) return;

    if(!this.spawner) return false;

    const deadSpawner = this.$$room.spawners[0];
    deadSpawner.moveNPCToThisSpawner(this);

    if(this.$$ai && this.$$ai.death) {
      this.$$ai.death.dispatch(killer);
    }

    DeathHelper.calculateLootDrops(this, killer);

    if(killer) {

      this.addAgro(killer, 1);

      // xp gain
      const giveXp = this.giveXp || { min: 1, max: 10 };
      const givenXp = random(giveXp.min, giveXp.max);

      let adjustedXp = this.$$room.calcAdjustedXPGain(givenXp);
      if(killer.hasEffect('Newbie')) adjustedXp += Math.floor(adjustedXp * 0.10);

      adjustedXp = this.calculateXPGainForPlayer(killer, adjustedXp);

      const earnedAP = this.calculateAPGainForPlayer(killer);

      killer.gainExpFromKills(adjustedXp, earnedAP);

      // skill gain
      const gainedSkill = this.calculateSkillGainForPlayer(killer, this.skillOnKill);
      killer.gainSkillFromKills(gainedSkill);

      // rep change
      if((<Player>killer).username) {
        this.repMod.forEach(({ allegiance, delta }) => {
          killer.changeRep(allegiance, delta);
        });

      }
    }
  }

  private calculateSkillGainForPlayer(char: Character, baseSkill: number): number {
    return baseSkill;
  }

  private calculateXPGainForPlayer(char: Character, baseXp: number): number {
    const levelDiff = Math.abs(char.level - this.level);

    if(levelDiff > 10) return Math.floor(baseXp * 0.75);
    if(levelDiff > 15) return Math.floor(baseXp * 0.50);
    if(levelDiff > 20) return Math.floor(baseXp * 0.25);

    return baseXp;
  }

  private calculateAPGainForPlayer(char: Character): number {
    if(!this.isElite && !this.hasEffect('Dangerous')) return 0;

    let value = 0;

    if(char.level <= this.level + 15)           value = 1;
    if(char.level <= this.level + 10)           value = 2;
    if(char.level <= this.level + 5)            value = 3;

    if(this.hasEffect('Dangerous') && value > 0)  value = 5;

    return value;
  }

  restore() {
    if(this.$$corpseRef) {
      if(!this.$$corpseRef.$heldBy) {
        this.$$room.dropCorpseItems(this.$$corpseRef);
        this.$$room.removeItemFromGround(this.$$corpseRef);
      }
    }

    if(this.spawner) {
      this.spawner.removeNPC(this);
    }
  }

  private randomlyReturnSfx(): string {
    if(!this.sfxMaxChance || !this.sfx) return '';
    return RollerHelper.XInY(1, this.sfxMaxChance) ? `monster-${this.sfx}` : '';
  }

  sendLeashMessage() {
    if(!this.leashMessage) return;
    this.sendClientMessageToRadius({ message: `You hear ${this.leashMessage}.`, sfx: this.randomlyReturnSfx() }, 8);
  }

  sendSpawnMessage() {
    if(!this.spawnMessage) return;
    this.sendClientMessageToRadius({ message: `You hear ${this.spawnMessage}.`, sfx: this.randomlyReturnSfx() }, 8);
  }

  setRightHand(item: IItem) {
    super.setRightHand(item);
    this.$$room.syncNPC(this);
  }

  setLeftHand(item: IItem) {
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

  getTraitLevel(trait: string): number {
    if(!this.traitLevels) return 0;

    return get(this, ['traitLevels', trait], 0);
  }

  recalculateStats() {
    super.recalculateStats();

    if(!this.$$room) return;
    const roomStats = this.$$room.state.getRoomStats();
    Object.keys(roomStats).forEach(stat => {
      this.totalStats[stat] = this.totalStats[stat] || 0;
      this.totalStats[stat] += roomStats[stat];
    });
  }
}
