
import { RestrictedNumber } from 'restricted-number';
import { Signal } from 'signals.js';

import {
  merge, includes, compact, values, random,
  startsWith, clone, get, reject, pick,
  sample, filter, maxBy, capitalize, isArray
} from 'lodash';

import {
  Item, EquippableItemClassesWithWeapons, EquipHash, GivesBonusInHandItemClasses, ValidItemTypes, WeaponClasses, ShieldClasses
} from './item';
import { MapLayer } from './maplayer';

import { HideReductionPercents } from '../../server/helpers/character/hide-reductions';

import * as Classes from '../../server/classes';
import { AttributeEffect, AugmentSpellEffect, OnHitEffect, Effect } from '../../server/base/Effect';
import * as Effects from '../../server/effects';
import { Sack } from './container/sack';
import { Belt } from './container/belt';
import { Pouch } from './container/pouch';
import { MoveHelper } from '../../server/helpers/character/move-helper';
import { nonenumerable } from 'nonenumerable';
import { CharacterHelper } from '../../server/helpers/character/character-helper';
import { MessageHelper } from '../../server/helpers/world/message-helper';
import { TrapHelper } from '../../server/helpers/world/trap-helper';
import { SkillHelper } from '../../server/helpers/character/skill-helper';
import { XPHelper } from '../../server/helpers/character/xp-helper';
import { TraitUsageModifiers } from '../helpers/trait-usage-modifiers';
import { VALID_TRADESKILLS_HASH } from '../helpers/tradeskill-helper';
import { Currency } from '../helpers/holiday-helper';

export type Allegiance =
  'None'
| 'Pirates'
| 'Townsfolk'
| 'Royalty'
| 'Adventurers'
| 'Wilderness'
| 'Underground'
| 'Enemy'
| 'NaturalResource'
| 'GM';

export type Sex = 'Male' | 'Female';

export type Direction = 'N' | 'S' | 'E' | 'W' | 'C';

export type Alignment = 'Good' | 'Neutral' | 'Evil';

export type CharacterClass =
  'Undecided'
| 'Mage'
| 'Healer'
| 'Warrior'
| 'Thief';

export const SkillClassNames = {
  Mace: 'Mace',
  Axe: 'Axe',
  Dagger: 'Dagger',
  OneHanded: 'Onehanded',
  TwoHanded: 'Twohanded',
  Shortsword: 'Shortsword',
  Polearm: 'Polearm',
  Ranged: 'Ranged',
  Martial: 'Martial',
  Staff: 'Staff',
  Throwing: 'Throwing',
  Thievery: 'Thievery',
  Wand: 'Wand',
  Conjuration: 'Conjuration',
  Restoration: 'Restoration',

  Alchemy: 'Alchemy',
  Spellforging: 'Spellforging',
  Runewriting: 'Runewriting',
  Metalworking: 'Metalworking',
  Survival: 'Survival'
};

export class Skills {

  // combat skills
  mace = 0;
  axe = 0;
  dagger = 0;
  onehanded = 0;
  twohanded = 0;
  shortsword = 0;
  polearm = 0;
  ranged = 0;
  martial = 0;
  staff = 0;
  throwing = 0;
  thievery = 0;
  wand = 0;
  conjuration = 0;
  restoration = 0;

  // trade skills
  alchemy = 0;
  spellforging = 0;
  metalworking = 0;
  survival = 0;
  runewriting = 0;
}

export class Stats {
  str? = 0;
  dex? = 0;
  agi? = 0;

  int? = 0;
  wis? = 0;
  wil? = 0;

  luk? = 0;
  cha? = 0;
  con? = 0;

  move? = 3;
  hpregen? = 1;
  mpregen? = 1;

  hp? = 100;
  mp? = 0;

  weaponDamageRolls? = 0;
  weaponArmorClass? = 0;
  armorClass? = 0;
  accuracy? = 0;
  offense? = 0;
  defense? = 0;

  stealth? = 0;
  perception? = 0;

  physicalDamageBoost? = 0;
  magicalDamageBoost? = 0;
  healingBoost? = 0;

  physicalDamageReflect? = 0;
  magicalDamageReflect? = 0;

  mitigation? = 0;
  magicalResist? = 0;
  physicalResist? = 0;
  necroticResist? = 0;
  energyResist? = 0;
  waterResist? = 0;
  fireResist? = 0;
  iceResist? = 0;
  poisonResist? = 0;
  diseaseResist? = 0;

  actionSpeed? = 1;
}

export type MonsterClass = 'Undead' | 'Beast' | 'Humanoid';

export type StatName =
  'str' | 'dex' | 'agi' | 'int' | 'wis' | 'wil' | 'luk' | 'cha' | 'con'
| 'move' | 'hpregen' | 'mpregen' | 'hp' | 'mp'
| 'armorClass' | 'accuracy' | 'offense' | 'defense' | 'weaponArmorClass' | 'weaponDamageRolls' | 'mitigation'
| 'stealth' | 'perception'
| 'magicalDamageBoost' | 'physicalDamageBoost' | 'healingBoost' | 'physicalDamageReflect' | 'magicalDamageReflect'
| 'magicalResist' | 'physicalResist' | 'necroticResist'| 'energyResist' | 'waterResist' | 'fireResist' | 'iceResist'
| 'poisonResist' | 'diseaseResist'
| 'actionSpeed';

export const MaxSizes = {
  Belt: 5,
  Sack: 25,
  Buyback: 5
};

export const AllNormalGearSlots = [
  'rightHand', 'leftHand', 'gear.Armor', 'gear.Robe1', 'gear.Robe2', 'gear.Ring1', 'gear.Ring2',
  'gear.Head', 'gear.Neck', 'gear.Waist', 'gear.Wrists', 'gear.Hands', 'gear.Feet', 'gear.Ear'
];

export class Character {
  name: string;
  agro: any = {};
  uuid: string;

  hp: RestrictedNumber = new RestrictedNumber(0, 100, 100);
  mp: RestrictedNumber = new RestrictedNumber(0, 0, 0);
  exp = 1000;

  currency: any = { gold: 0 };

  public get currentGold(): number {
    return this.currency.gold;
  }

  protected stats: Stats = new Stats();
  protected totalStats: any = new Stats();

  protected skills: Skills = new Skills();

  get baseStats(): Stats {
    return clone(this.stats);
  }

  get sumStats(): Stats {
    return clone(this.totalStats);
  }

  get allSkills() {
    return clone(this.skills);
  }

  allegiance: Allegiance = 'None';
  sex: Sex = 'Male';
  dir: Direction = 'S';

  x = 0;
  y = 0;
  map: string;

  level = 1;

  @nonenumerable
  highestLevel = 1;

  skillOnKill: number;

  baseClass: CharacterClass = 'Undecided';
  monsterClass?: MonsterClass;

  sack: Sack = new Sack({ size: this.sackSize });
  belt: Belt = new Belt({ size: this.beltSize });
  pouch: Pouch = new Pouch({ size: 0 });

  effects: { [key: string]: Effect } = {};

  gear: any = {};
  leftHand: Item;
  rightHand: Item;
  potionHand: Item;

  swimLevel: number;

  @nonenumerable
  fov: any;

  @nonenumerable
  $$map: any;

  @nonenumerable
  $$deathTicks: number;

  @nonenumerable
  $$room: any;

  @nonenumerable
  $$corpseRef: Item;

  @nonenumerable
  aquaticOnly: boolean;

  @nonenumerable
  avoidWater = true;

  combatTicks = 0;

  @nonenumerable
  $$ai: any;

  @nonenumerable
  $$flaggedSkills;

  $$interceptor: Character;

  sprite: number;

  alignment: Alignment = 'Neutral';
  allegianceReputation: any = {};
  affiliation?: string;

  @nonenumerable
  public $$pets: Character[];

  @nonenumerable
  public $$owner: Character;

  @nonenumerable
  protected $$messageQueue: any[];

  get effectsList(): Effect[] {
    return values(this.effects);
  }

  get dispellableEffects(): Effect[] {
    return this.effectsList.filter(x => x.canBeUnapplied());
  }

  get augmentEffectsList(): AugmentSpellEffect[] {
    return <any[]>values(this.effects).filter(x => (<any>x).augmentAttack);
  }

  get onHitEffectsList(): OnHitEffect[] {
    return <any[]>values(this.effects).filter(x => (<any>x).onHit);
  }

  get attributeEffectsList(): AttributeEffect[] {
    return <any[]>values(this.effects).filter(x => (<any>x).modifyDamage);
  }

  get isInCombat() {
    return this.combatTicks > 0;
  }

  get sackSize() {
    return MaxSizes.Sack;
  }

  get beltSize() {
    return MaxSizes.Belt;
  }

  get isNaturalResource(): boolean {
    return this.allegiance === 'NaturalResource';
  }

  get isOreVein(): boolean {
    return this.isNaturalResource && includes(this.name, 'vein');
  }

  getTotalStat(stat: StatName) {
    return this.totalStats[stat] || 0;
  }

  getBaseStat(stat: StatName) {
    return this.stats[stat] || 0;
  }

  setBaseStat(stat: StatName, value: number) {
    this.stats[stat] = value;
  }

  initAI() {
    this.$$ai = {
      tick: new Signal(),
      mechanicTick: new Signal(),
      death: new Signal(),
      damageTaken: new Signal()
    };
  }

  initHpMp() {
    this.hp = new RestrictedNumber(this.hp.minimum, this.hp.maximum, this.hp.__current);
    this.mp = new RestrictedNumber(this.mp.minimum, this.mp.maximum, this.mp.__current);
  }

  initSack() {
    this.sack = new Sack(this.sack);
  }

  initBelt() {
    this.belt = new Belt(this.belt);
  }

  initPouch() {
    this.pouch = new Pouch(this.pouch);
  }

  initHands() {
    if(this.leftHand) this.leftHand = new Item(this.leftHand);
    if(this.rightHand) this.rightHand = new Item(this.rightHand);
    if(this.potionHand) this.potionHand = new Item(this.potionHand);
  }

  initGear() {
    Object.keys(this.gear).forEach(slot => {
      if(!this.gear[slot]) return;
      this.gear[slot] = new Item(this.gear[slot]);
    });
  }

  initEffects() {
    if(isArray(this.effects)) this.effects = {};

    Object.keys(this.effects).forEach(effName => {
      if(!Effects[effName]) {
        delete this.effects[effName];
        return;
      }
      const eff = new Effects[effName](this.effects[effName]);
      eff.iconData = this.effects[effName].iconData;

      this.effects[effName] = eff;
    });
  }

  constructor(opts) {
    merge(this, opts);

    this.initHpMp();
    this.init();
  }

  init() {}
  initServer() {}

  toSaveObject(): any {
    let keys = reject(Object.getOwnPropertyNames(this), key => {
      if(key === '_id') return true;
      if(startsWith(key, '$$')) return true;
      if(key === '$fov' || key === 'avoidWater' || key === 'bgmSetting') return false;
      return false;
    });

    // fix the $-prefixed non-enumerable attrs
    keys = keys.map(key => startsWith(key, '$') ? key.substring(1) : key);

    return pick(this, keys);
  }

  sellValue(item: Item) {
    if(item.sellValue) return item.sellValue;

    // every cha after 10 increases the sale value by ~2%
    const valueMod = 10 - ((this.getTotalStat('cha') - 10) / 5);
    return Math.max(1, Math.floor(item.value / valueMod));
  }

  hasEmptyHand() {
    return !this.leftHand || !this.rightHand;
  }

  determineItemType(itemClass) {
    return EquipHash[itemClass] || itemClass;
  }

  private getItemSlotToEquipIn(item: Item) {

    let slot = item.itemClass;

    if(EquipHash[item.itemClass] === 'Robe') {
      const armor = this.gear.Armor;
      const robe1 = this.gear.Robe1;
      const robe2 = this.gear.Robe2;

      if(armor && robe1 && robe2) return false;

      if(!armor) {
        slot = 'Armor';
      } else if(!robe1) {
        slot = 'Robe1';
      } else if(!robe2) {
        slot = 'Robe2';
      }

    } else if(EquipHash[item.itemClass] === 'Armor') {
      const armor = this.gear.Armor;
      if(armor) return false;

      slot = 'Armor';

    } else if(item.itemClass === 'Ring') {
      const ring1 = this.gear.Ring1;
      const ring2 = this.gear.Ring2;

      if(ring1 && ring2) return false;

      if(!ring1) {
        slot = 'Ring1';
      } else if(!ring2) {
        slot = 'Ring2';
      }
    } else {
      const realSlot = this.determineItemType(item.itemClass);
      if(!includes(['Head', 'Neck', 'Waist', 'Wrists', 'Hands', 'Feet', 'Ear'], realSlot)) return false;
      if(this.gear[realSlot]) return false;

      slot = realSlot;
    }

    return slot;
  }

  gainBaseStat(stat: StatName, value = 1) {
    this.stats[stat] += value;
    this.recalculateStats();
  }

  loseBaseStat(stat: StatName, value = 1) {
    this.stats[stat] -= value;
    if(this.stats[stat] <= 1) this.stats[stat] = 1;
    this.recalculateStats();
  }

  canGetBonusFromItemInHand(item: Item): boolean {

    const isShield = includes(ShieldClasses, item.itemClass);

    // shields do. not. work. in the main hand
    if(isShield && this.rightHand === item && !this.getTraitLevel('Shieldbearer')) return false;

    // ammo does not work unless you can actually shoot it
    if(this.leftHand === item && item.shots && (!this.rightHand || !this.rightHand.canShoot)) return false;

    // weapons do not work in the left hand unless they're a shield or offhand item
    if(this.leftHand === item && !item.offhand && !isShield && !item.shots && includes(WeaponClasses, item.itemClass)) return false;

    return this.checkCanEquipWithoutGearCheck(item)
        && item.isOwnedBy(this)
        && includes(GivesBonusInHandItemClasses, item.itemClass);
  }

  private adjustStatsBasedOnEffect(eff: Effect, isLose = false) {
    const statBuffs = eff.allBoosts || {};

    Object.keys(statBuffs).forEach(stat => {
      this.totalStats[stat] += (statBuffs[stat] * (isLose ? -1 : 1));
    });
  }

  private canBeEncumbered(): boolean {
    if(this.baseClass !== 'Mage' && this.baseClass !== 'Healer') return false;
    return !this.getTraitLevel('LightenArmor');
  }

  recalculateStats() {
    this.totalStats = {};
    let castEncumber = false;

    // base stats
    Object.keys(this.stats).forEach(stat => {
      if(isNaN(this.stats[stat])) return;
      this.totalStats[stat] = this.stats[stat] || 0;
    });

    // stats from effects
    values(this.effects).forEach(eff => {
      this.adjustStatsBasedOnEffect(eff);
    });

    // stats from class
    const classStats = Classes[this.baseClass].calcBonusStatsForCharacter(this);

    Object.keys(classStats).forEach(stat => {
      if(isNaN(classStats[stat])) return;
      this.totalStats[stat] = this.totalStats[stat] || 0;
      this.totalStats[stat] += classStats[stat];
    });

    const encrustMaxes = {};

    const addStatsForItem = (item: Item) => {
      Object.keys(item.stats).forEach(stat => {
        if(isNaN(item.stats[stat])) return;
        this.totalStats[stat] = this.totalStats[stat] || 0;
        this.totalStats[stat] += item.stats[stat];
      });

      if(item.encrust) {
        encrustMaxes[item.encrust.desc] = encrustMaxes[item.encrust.desc] || { max: item.encrust.maxEncrusts, count: 0, stats: item.encrust.stats };
        encrustMaxes[item.encrust.desc].count++;

        const max = encrustMaxes[item.encrust.desc].max;

        const addEncrustStats = () => {
          Object.keys(item.encrust.stats).forEach(stat => {
            if(isNaN(item.encrust.stats[stat])) return;
            this.totalStats[stat] = this.totalStats[stat] || 0;
            this.totalStats[stat] += item.encrust.stats[stat];
          });
        };

        if(!max || encrustMaxes[item.encrust.desc].count <= max) {
          addEncrustStats();
        }

        const canMirrorProc = get(this, 'gear.Hands') === item || get(this, 'gear.Feet') === item;
        if(this.getTraitLevel('MirroredEnchantments') && canMirrorProc) {
          encrustMaxes[item.encrust.desc].count++;

          if(!max || encrustMaxes[item.encrust.desc].count <= max) {
            addEncrustStats();
          }
        }
      }
    };

    // stats from gear
    const allGear = compact(values(this.gear));

    allGear.forEach(item => {
      if(!item.stats || !this.checkCanEquipWithoutGearCheck(item) || !item.isOwnedBy(this)) return;
      addStatsForItem(item);
      if(item.isHeavy) castEncumber = true;
    });

    // stats from hands
    if(this.leftHand && this.leftHand.stats && this.canGetBonusFromItemInHand(this.leftHand))    addStatsForItem(this.leftHand);
    if(this.rightHand && this.rightHand.stats && this.canGetBonusFromItemInHand(this.rightHand)) addStatsForItem(this.rightHand);

    // stats from traits
    this.adjustStatsForTraits();

    // reset hp/mp
    this.hp.maximum = Math.max(1, this.getTotalStat('hp'));
    this.hp.__current = Math.min(this.hp.__current, this.hp.maximum);

    this.mp.maximum = Math.max(0, this.stats.mp === 0 ? 0 : this.getTotalStat('mp'));
    this.mp.__current = Math.min(this.mp.__current, this.mp.maximum);

    this.totalStats.stealth += this.getTraitLevelAndUsageModifier('ShadowStepper');

    // if you're hiding, you have a hide penalty
    if(this.totalStats.stealth > 0) {
      this.totalStats.stealth -= this.hidePenalty();
    }

    this.totalStats.mitigation += this.getTraitLevelAndUsageModifier('UnarmoredSavant');

    // always recalculate perception
    this.totalStats.perception += this.perceptionLevel();

    const isEncumbered = this.hasEffect('Encumbered');

    if(this.canBeEncumbered()) {

      if(isEncumbered && !castEncumber) {
        this.unapplyEffect(isEncumbered, true);

      } else if(!isEncumbered && castEncumber) {
        const encumbered = new Effects.Encumbered({});
        encumbered.cast(this, this);
      }
    } else {
      if(isEncumbered) {
        this.unapplyEffect(isEncumbered, true);
      }
    }

    this.recalculateStatsBasedOnOwner();
    if(this.$$pets) this.$$pets.forEach(pet => pet.recalculateStats());
  }

  private recalculateStatsBasedOnOwner() {
    if(!this.$$owner) return;

    const familiarStrength = this.$$owner.getTraitLevelAndUsageModifier('FamiliarStrength');
    this.totalStats.str += familiarStrength;
    this.totalStats.int += familiarStrength;
    this.totalStats.wis += familiarStrength;

    const familiarFortitude = this.$$owner.getTraitLevelAndUsageModifier('FamiliarFortitude');
    this.hp.maximum += Math.floor(this.hp.maximum * (familiarFortitude / 100));
    this.hp.__current = Math.min(this.hp.__current, this.hp.maximum);
  }

  public getBonusUsableSkillsBasedOnOwner(): string[] {
    if(!this.$$owner) return [];

    const allSkills = [];

    if(this.$$owner.getTraitLevel('FamiliarFists')) allSkills.push('Rapidpunch');

    return allSkills;
  }

  itemCheck(item: Item) {
    if(!item) return;
    if(item.itemClass === 'Corpse') return;
    if(item.binds && !item.owner) {
      item.setOwner(this);
      if(item.tellsBind) {
        this.sendClientMessageToRadius({
          message: `${this.name} has looted ${item.desc}.`,
          subClass: 'always loot'
        }, 4);
      }

      this.sendClientMessage(`The ${item.itemClass.toLowerCase()} feels momentarily warm to the touch as it molds to fit your grasp.`);
    }
  }

  setLeftHand(item: Item, recalc = true) {
    const oldLeftHand = this.leftHand;

    this.leftHand = item;
    this.itemCheck(item);

    if(oldLeftHand)                                   this.checkAndUnapplyPermanentEffect(oldLeftHand);
    if(item && this.canGetBonusFromItemInHand(item))  this.checkAndCreatePermanentEffect(item);

    if(recalc) {
      this.recalculateStats();
    }
  }

  setRightHand(item: Item, recalc = true) {
    const oldRightHand = this.rightHand;

    this.rightHand = item;
    this.itemCheck(item);

    if(oldRightHand)                                  this.checkAndUnapplyPermanentEffect(oldRightHand);
    if(item && this.canGetBonusFromItemInHand(item))  this.checkAndCreatePermanentEffect(item);

    if(recalc) {
      this.recalculateStats();
    }
  }

  setPotionHand(item: Item) {
    this.itemCheck(item);
    this.potionHand = item;
  }

  private checkAndCreatePermanentEffect(item: Item) {
    if(!item || !item.effect || !item.effect.autocast || !item.effect.name) return;
    const effect = new Effects[item.effect.name](item.effect);
    effect.flagPermanent(this.uuid);
    effect.cast(this, this);
  }

  private checkAndUnapplyPermanentEffect(item: Item) {
    if(!item || !item.effect || !item.effect.autocast || !item.effect.name) return;

    const effect = this.hasEffect(item.effect.name);
    if(effect) {
      this.unapplyEffect(effect, true);
    }
  }

  tryToCastEquippedEffects() {
    AllNormalGearSlots.forEach(slot => {

      // doesnt count if they're in hand
      if(!includes(slot, 'gear')) return;

      const item = get(this, slot);
      this.checkAndCreatePermanentEffect(item);
    });
  }

  equip(item: Item) {
    if(!this.canEquip(item)) return false;
    this._equip(item);
    return true;
  }

  _equip(item: Item) {
    const slot = this.getItemSlotToEquipIn(item);
    if(!slot) return false;

    this.gear[slot] = item;
    this.recalculateStats();
    this.itemCheck(item);
    this.checkAndCreatePermanentEffect(item);
  }

  unequip(slot: string) {
    const item = this.gear[slot];

    this.gear[slot] = null;

    this.checkAndUnapplyPermanentEffect(item);

    this.recalculateStats();
  }

  private checkCanEquipWithoutGearCheck(item: Item) {
    if(!item) return false;
    if(!item.hasCondition()) return false;
    if(!includes(EquippableItemClassesWithWeapons, item.itemClass)) return false;
    if(item.requirements) {
      if(item.requirements.level && this.level < item.requirements.level) return false;
      if(item.requirements.profession && !includes(item.requirements.profession, this.baseClass)) return false;
      if(item.requirements.alignment && this.alignment !== item.requirements.alignment) return false;
      if(item.requirements.skill) {
        const { name, level } = item.requirements.skill;
        const myLevel = this.calcSkillLevel(name);
        if(myLevel < level) return false;
      }
    }

    return true;
  }

  canEquip(item: Item) {
    if(!item) return false;
    if(!item.isOwnedBy(this)) return false;
    if(!this.checkCanEquipWithoutGearCheck(item)) return false;

    const slot = this.getItemSlotToEquipIn(item);
    if(!slot || this.gear[slot]) return false;
    return true;
  }

  addItemToSack(item: Item) {
    if(item.itemClass === 'Coin') {
      this.earnGold(item.value, 'Game:SackGold');
      return true;
    }

    const result = this.sack.addItem(item);
    if(result) {
      this.sendClientMessage(result);
      return false;
    }

    this.itemCheck(item);
    return true;
  }

  addItemToPouch(item: Item) {
    const result = this.pouch.addItem(item);
    if(result) {
      this.sendClientMessage(result);
      return false;
    }

    this.itemCheck(item);
    return true;
  }

  addItemToBelt(item: Item) {
    const result = this.belt.addItem(item);
    if(result) {
      this.sendClientMessage(result);
      return false;
    }

    this.itemCheck(item);
    return true;
  }

  earnGold(gold: number, reason?: string) {
    this.earnCurrency(Currency.Gold, gold, reason);
  }

  spendGold(gold: number, on?: string) {
    this.spendCurrency(Currency.Gold, gold, on);
  }

  hasCurrency(currency: Currency, amt: number): boolean {
    if(!currency) currency = Currency.Gold;
    return this.currency[currency] >= amt;
  }

  earnCurrency(currency: Currency, amt: number, on?: string) {
    if(!currency) currency = Currency.Gold;

    if(!this.currency[currency]) this.currency[currency] = 0;
    this.currency[currency] += Math.round(amt);
  }

  spendCurrency(currency: Currency, amt: number, on?: string) {
    if(!currency) currency = Currency.Gold;

    if(!this.currency[currency]) this.currency[currency] = 0;
    this.currency[currency] -= Math.round(amt);
    if(this.currency[currency] <= 0) this.currency[currency] = 0;
  }

  getDirBasedOnDiff(x, y): string {

    const checkX = Math.abs(x);
    const checkY = Math.abs(y);

    if(checkX >= checkY) {
      if(x > 0) {
        return 'East';
      } else if(x < 0) {
        return 'West';
      }

    } else if(checkY > checkX) {
      if(y > 0) {
        return 'South';
      } else if(y < 0) {
        return 'North';
      }
    }

    return 'South';
  }

  setDirBasedOnXYDiff(x, y) {
    if(x === 0 && y === 0) return;
    this.dir = <Direction>this.getDirBasedOnDiff(x, y).substring(0, 1);
  }

  setDirRelativeTo(char: Character) {
    const diffX = char.x - this.x;
    const diffY = char.y - this.y;

    this.setDirBasedOnXYDiff(diffX, diffY);
  }

  canSee(xOffset, yOffset) {
    if(!this.fov) return false;
    if(!this.fov[xOffset]) return false;
    if(!this.fov[xOffset][yOffset]) return false;
    return true;
  }

  getXYFromDir(dir: Direction) {
    const checkDir = dir.toUpperCase();
    switch(checkDir) {
      case 'N':  return { x: 0,   y: -1 };
      case 'E':  return { x: 1,   y: 0 };
      case 'S':  return { x: 0,   y: 1 };
      case 'W':  return { x: -1,  y: 0 };

      case 'NW': return { x: -1,  y: -1 };
      case 'NE': return { x: 1,   y: -1 };
      case 'SW': return { x: -1,  y: 1 };
      case 'SE': return { x: 1,  y: 1 };

      default:   return { x: 0,   y: 0 };
    }
  }

  takeSequenceOfSteps(steps: any[], isChasing = false, recalculateFOV = false): boolean {
    const denseTiles = this.$$map.layers[MapLayer.Walls].data;
    const fluidTiles = this.$$map.layers[MapLayer.Fluids].data;

    const oldEventSource = this.$$room.state.getInteractable(this.x, this.y, true, 'EventSource');

    let successfulStepsNoDensity = true;

    steps.forEach(step => {
      const nextTileLoc = ((this.y + step.y) * this.$$map.width) + (this.x + step.x);
      const nextTile = denseTiles[nextTileLoc];
      const isNextTileFluid = fluidTiles[nextTileLoc] !== 0;

      const oldPos = { x: this.x, y: this.y };


      if(this.aquaticOnly && !isNextTileFluid) return;

      if(nextTile === 0) {
        const object = this.$$room.state.getInteractableOrDenseObject(this.x + step.x, this.y + step.y);
        if(object && object.density) {
          if(object.type === 'Door') {
            if(!MoveHelper.tryToOpenDoor(this, object, { gameState: this.$$room.state })) {
              successfulStepsNoDensity = false;
              return;
            }
          } else {
            successfulStepsNoDensity = false;
            return;
          }
        }
      } else {
        successfulStepsNoDensity = false;
        return;
      }

      if(!isChasing && !this.isValidStep(step)) return;
      this.x += step.x;
      this.y += step.y;

      if(this.isPlayer())   this.$$room.state.updatePlayerInQuadtree(this, oldPos);
      else                  this.$$room.state.updateNPCInQuadtree(this, oldPos);
    });

    const unmodifiedPos = { x: this.x, y: this.y };

    if(this.x < 0) this.x = 0;
    if(this.y < 0) this.y = 0;

    if(this.x > this.$$map.width)  this.x = this.$$map.width;
    if(this.y > this.$$map.height) this.y = this.$$map.height;

    const newEventSource = this.$$room.state.getInteractable(this.x, this.y, true, 'EventSource');

    if(oldEventSource) {
      const evt = get(oldEventSource, 'properties.offEvent');
      if(evt) {
        this.$$room.dispatchEvent(evt, { player: this });
      }
    }

    if(newEventSource) {
      const evt = get(newEventSource, 'properties.onEvent');
      if(evt) {
        this.$$room.dispatchEvent(evt, { player: this });
      }
    }

    if(this.isPlayer())   this.$$room.state.updatePlayerInQuadtree(this, unmodifiedPos);
    else                  this.$$room.state.updateNPCInQuadtree(this, unmodifiedPos);

    const potentialTrap = this.$$room.state.getInteractable(this.x, this.y, true, 'Trap');
    if(potentialTrap && potentialTrap.properties && potentialTrap.properties.effect) {
      TrapHelper.triggerTrap(this, potentialTrap);
    }

    // player only
    if(recalculateFOV) {
      this.$$room.setPlayerXY(this, this.x, this.y);
      this.$$room.state.calculateFOV(this);
    }

    return successfulStepsNoDensity;
  }

  isValidStep(step) {
    return true;
  }

  isDead() {
    return this.hp.atMinimum();
  }

  changeBaseClass(newClass) {
    this.baseClass = newClass;
    Classes[this.baseClass].becomeClass(this);
  }

  kill(dead: Character, opts: { isPetKill: boolean } = { isPetKill: false }) {}

  flagSkill(skills) {}

  canDie() {
    return this.hp.atMinimum();
  }

  tickEffects() {
    this.effectsList.forEach(eff => eff.tick(this));
  }

  clearAllEffects() {
    this.effectsList.forEach(effect => {
      this.unapplyEffect(effect, true, true);
    });
  }

  clearEffects() {
    const shouldClearPermanents = !this.hasEffect('Secondwind');
    const noClear = ['Nourishment', 'Malnourished', 'Newbie'];
    this.effectsList.forEach(effect => {
      if(includes(noClear, effect.name)) return;
      if(get(effect, 'effectInfo.isPermanent') && !shouldClearPermanents) return;
      this.unapplyEffect(effect, true, true);
    });
  }

  die(killer?: Character, silent = false) {
    this.dir = 'C';
    this.clearEffects();

    this.$$deathTicks = 120;

    this.$$room.analyticsHelper.trackKill(this, killer);

    if(silent) {
      this.hp.toMinimum();
      this.$$deathTicks = 5;
      if(this.$$owner) this.$$owner.$$pets = reject(this.$$owner.$$pets, (x: Character) => x === this);
    }
  }

  revive() {}
  restore(force = false) {}

  gainExp(xp: number) {
    if(this.isDead()) return;

    xp = Math.round(xp);

    const prevXp = this.exp;

    this.exp += xp;

    if(this.exp <= 100) {
      this.exp = 100;
    }

    if(isNaN(this.exp)) {
      this.exp = prevXp;
    }

    if(xp < 0) {
      do {
        const prevLevelXp = this.calcLevelXP(this.level);
        if(this.exp < prevLevelXp && this.level >= 2) {
          this.level -= 1;
        } else {
          break;
        }
      } while(true);
    }
  }

  gainExpFromKills(xp: number) {
    this.gainExp(xp);

    if(this.$$owner) {
      this.$$owner.gainExpFromKills(xp);
    }
  }

  tryLevelUp(maxLevel = 0) {
    do {
      if(this.level >= maxLevel) break;

      const neededXp = this.calcLevelXP(this.level + 1);
      if(this.exp > neededXp) {
        this.level += 1;
        if(this.level > this.highestLevel) {
          this.highestLevel = this.level;
          this.gainLevelStats();
        }
        break;
      } else {
        break;
      }
    } while(this.level < maxLevel);
  }

  gainLevelStats() {
    Classes[this.baseClass].gainLevelStats(this);
  }

  calcLevelXP(level: number) {
    return XPHelper.calcLevelXP(level);
  }

  isValidSkill(type) {
    return includes(ValidItemTypes, type) || SkillClassNames[type] || SkillClassNames[capitalize(type)];
  }

  gainCurrentSkills(skillGained = 1) {
    if(!this.$$flaggedSkills || !this.$$flaggedSkills.length) return;
    const [primary, secondary, tertiary, quaternary] = compact(this.$$flaggedSkills);
    if(!primary) return;

    if(quaternary) {
      this.gainSkill(primary, skillGained * 0.45);
      this.gainSkill(secondary, skillGained * 0.25);
      this.gainSkill(tertiary, skillGained * 0.15);
      this.gainSkill(quaternary, skillGained * 0.15);

    } else if(tertiary) {
      this.gainSkill(primary, skillGained * 0.55);
      this.gainSkill(secondary, skillGained * 0.25);
      this.gainSkill(tertiary, skillGained * 0.20);

    } else if(secondary) {
      this.gainSkill(primary, skillGained * 0.75);
      this.gainSkill(secondary, skillGained * 0.25);

    } else {
      this.gainSkill(primary, skillGained);
    }
  }

  gainSkill(type, skillGained = 1, bypassRoomCap = false) {
    if(!this.isValidSkill(type)) return;

    // you can gain up to 2 skills post-cap if you feel like grinding heavily
    if(!bypassRoomCap && skillGained > 0 && !VALID_TRADESKILLS_HASH[type]) {
      const curLevel = this.calcSkillLevel(type);
      const maxLevel = this.$$room.state.maxSkill;
      const diff = curLevel - maxLevel;

      if(diff === 0) skillGained /= 10;
      if(diff === 1) skillGained /= 33;

      if(diff > 1)   return;
    }

    this._gainSkill(type, skillGained);
  }

  _gainSkill(type, skillGained: number) {
    type = type.toLowerCase();

    const prevVal = this.skills[type];

    this.skills[type] += skillGained;

    if(this.skills[type] <= 0) this.skills[type] = 0;

    if(isNaN(this.skills[type]) || !isFinite(this.skills[type])) {
      this.skills[type] = prevVal;
      throw new Error(`Invalid skill value for ${this.name}: ${type}, gained: ${skillGained}, cur: ${this.skills[type]}`);
    }
  }

  setSkill(type, skill: number) {
    type = type.toLowerCase();
    this.skills[type] = skill;
  }

  addSkillLevels(type: string, levels: number) {
    const curLevel = this.calcSkillLevel(type);
    const nextLevel = SkillHelper.calcSkillXP(curLevel + levels);
    this.skills[type] = nextLevel;
  }

  calcSkillLevel(type: string) {
    return SkillHelper.calcSkillLevel(this, type);
  }

  applyEffect(effect: Effect) {
    if(this.isNaturalResource) return;

    const existingEffect = this.hasEffect(effect.name);

    const oldPermanency = get(existingEffect, 'effectInfo.isPermanent', false);
    const newPermanency = get(effect, 'effectInfo.isPermanent', false);

    if(existingEffect) {
      if(oldPermanency && !newPermanency && !includes(effect.name, 'Party')) {
        this.sendClientMessage(`A new casting of ${effect.name} refused to take hold.`);
        return;
      }

      this.unapplyEffect(existingEffect, true, true);
    }

    if(effect.duration > 0 || newPermanency) {
      this.effects[effect.name] = effect;
    }

    // if(existingEffect) effect.shouldNotShowMessage = true;
    effect.effectStart(this);
    // if(existingEffect) effect.shouldNotShowMessage = false;
  }

  unapplyEffect(effect: Effect, prematurelyEnd = false, hideMessage = false) {

    this.adjustStatsBasedOnEffect(effect, true);

    if(prematurelyEnd) {
      effect.hasEnded = true;
      effect.shouldNotShowMessage = hideMessage;
      effect.effectEnd(this);
    }

    delete this.effects[effect.name];
  }

  hasEffect(effectName): Effect {
    return this.effects[effectName];
  }

  hasHeldItem(item: string, hand: 'left'|'right' = 'right'): boolean {
    const ref = this[`${hand}Hand`];
    return (ref && ref.name === item && ref.isOwnedBy && ref.isOwnedBy(this));
  }

  hasHeldItems(item1: string, item2: string): boolean {
    return (this.hasHeldItem(item1, 'right') && this.hasHeldItem(item2, 'left'))
      || (this.hasHeldItem(item2, 'right') && this.hasHeldItem(item1, 'left'));
  }

  useItem(source: 'leftHand' | 'rightHand' | 'potionHand', fromApply = false) {
    const item: Item = this[source];

    if(item && item.succorInfo && this.$$room.state.isSuccorRestricted(this)) {
      return this.sendClientMessage('You stop, unable to envision the place in your memory!');
    }

    if(!item || !item.canUseInCombat(this) || !item.use(this, fromApply)) return this.sendClientMessage('You cannot use that item!');

    let remove = false;

    if(item.itemClass === 'Bottle' && item.ounces === 0) {
      this.sendClientMessage('The bottle was empty.');
      remove = true;

    } else if(item.ounces > 0) {
      item.ounces--;
      if(item.ounces <= 0) remove = true;
    }

    if(remove) {
      this[source] = null;
      this.recalculateStats();
    }

    if(item.succorInfo) {
      this.doSuccor(item.succorInfo);
    }
  }

  doSuccor(succorInfo) {
    if(this.$$room.state.isSuccorRestricted(this)) return this.sendClientMessage('The blob turns to ash in your hand!');

    this.sendClientMessage('You are whisked back to the place in your stored memories!');

    return this.$$room.teleport(this, {
      x: succorInfo.x,
      y: succorInfo.y,
      newMap: succorInfo.map,
      zSet: succorInfo.z
    });
  }

  receiveMessage(from, message) {}

  sendClientMessage(message, shouldQueue = false) {

    if(shouldQueue && this.isPlayer()) {
      this.$$messageQueue.push(message);
    } else {
      MessageHelper.sendClientMessage(this, message);
    }

    if(this.$$interceptor) {
      MessageHelper.sendClientMessage(this.$$interceptor, message, this);
    }
  }

  sendClientMessageToRadius(message, radius = 4, except = [], useSight = false, formatArgs = [], shouldQueue = false) {
    MessageHelper.sendClientMessageToRadius(this, message, radius, except, useSight, formatArgs, shouldQueue);
  }

  sendClientMessageFromNPC(npc: Character, message: string): void {
    this.sendClientMessage({ name: npc.name, message, subClass: 'chatter' });
  }

  sendClientMessageBatch() {
    if(this.$$messageQueue.length === 0) return;
    MessageHelper.sendClientMessageBatch(this, this.$$messageQueue);
    this.$$messageQueue = [];
  }

  isPlayer() {
    return false;
  }

  tick() {
    if(this.isNaturalResource) return;

    if(this.isDead()) {
      CharacterHelper.handleDeadCharacter(this);
      return;
    }

    const hpRegen = this.getTotalStat('hpregen');
    const mpRegen = this.getTotalStat('mpregen');

    if(this.hp.__current + hpRegen > 0) this.hp.add(hpRegen);
    this.mp.add(mpRegen);
  }

  distFrom(point, vector?) {
    let checkX = this.x;
    let checkY = this.y;

    if(vector) {
      checkX += vector.x || 0;
      checkY += vector.y || 0;
    }

    return Math.floor(Math.sqrt(Math.pow(point.x - checkX, 2) + Math.pow(point.y - checkY, 2)));
  }

  resetAgro(full = false) {
    if(full) {
      this.agro = {};
      return;
    }

    Object.keys(this.agro).forEach(uuid => this.agro[uuid] = 1);
  }

  addAgroOverTop(char: Character, value: number) {
    if(!char || (<any>this).hostility === 'Never') return;

    const myAgro = this.agro[char.uuid] || 0;
    const maxAgroKey = maxBy(Object.keys(this.agro), key => this.agro[key]);
    const maxAgro = this.agro[maxAgroKey] || 0;

    let boostValue = value;

    if(maxAgroKey === char.uuid) boostValue += (maxAgro - myAgro);

    this.addAgro(char, boostValue);
  }

  addAgro(char: Character, value) {
    if(!char || char === this || (<any>this).hostility === 'Never') return;

    // invis is normally removed on agro gain, unless it's permanent
    const invis = char.hasEffect('Invisible');
    if(invis && !invis.effectInfo.isPermanent) {
      char.unapplyEffect(invis, true);
    }

    // npcs of the same allegiance can't agro to each other
    if(char.allegiance === this.allegiance && !char.isPlayer() && !this.isPlayer()) return;

    const agroAdd = (uuid, val) => {
      this.agro[uuid] = this.agro[uuid] || 0;
      this.agro[uuid] += val;
      if(this.agro[uuid] <= 0) this.removeAgroUUID(char.uuid);
    };

    agroAdd(char.uuid, value);

    if(char.isPlayer() && value > 0) {
      const party = (<any>char).party;
      if(party && (<any>this).partyName !== (<any>char).partyName) {
        party.members.forEach(({ username }) => {
          agroAdd(username, 1);
        });
      }
    }
  }

  removeAgro(char: Character) {
    this.removeAgroUUID(char.uuid);
  }

  private removeAgroUUID(charUUID: string) {
    delete this.agro[charUUID];
  }

  changeRep(allegiance: Allegiance, modifier) {
    this.allegianceReputation[allegiance] = this.allegianceReputation[allegiance] || 0;
    this.allegianceReputation[allegiance] += modifier;
  }

  stealthLevel(): number {

    /** PERK:CLASS:THIEF:Thieves get an innate bonus to hiding. */
    const isThief = this.baseClass === 'Thief';
    const thiefLevel = this.calcSkillLevel(SkillClassNames.Thievery);
    const casterThiefSkill = thiefLevel * (isThief ? 1.5 : 1) * 5;
    const casterAgi = this.getTotalStat('agi') * (isThief ? 5 : 3);
    const casterLevel = this.level;

    const hideBoost = isThief ? Math.floor(thiefLevel / 5) * 10 : 0;
    const traitBoost = this.getTraitLevelAndUsageModifier('DarkerShadows');

    const hideLevel = (casterThiefSkill + casterAgi + casterLevel + hideBoost + traitBoost);
    return Math.floor(hideLevel);
  }

  hidePenalty(): number {
    const leftHandClass = this.leftHand ? this.leftHand.itemClass : '';
    const rightHandClass = this.rightHand ? this.rightHand.itemClass : '';

    let reductionPercent = (HideReductionPercents[leftHandClass] || 0) + (HideReductionPercents[rightHandClass] || 0);
    reductionPercent = Math.max(0, reductionPercent - this.getTraitLevelAndUsageModifier('ShadowSheath'));

    const stealth = this.getTotalStat('stealth');
    return Math.floor(stealth * (reductionPercent / 100));
  }

  perceptionLevel(): number {

    /** PERK:CLASS:THIEF:Thieves get an innate bonus to perception. */
    const isThief = this.baseClass === 'Thief';

    const thiefLevel = this.calcSkillLevel(SkillClassNames.Thievery);
    const dex = this.getTotalStat('dex') * 2;
    const casterLevel = this.level;

    const thiefTotal = (thiefLevel + dex) * (isThief ? 4.5 : 2);
    const normalTotal = casterLevel * 6;

    return Math.floor(thiefTotal + normalTotal);
  }

  isHidden(): boolean {
    return !!(this.hasEffect('Hidden') || this.hasEffect('ShadowMeld'));
  }

  canSeeThroughStealthOf(char: Character) {
    if(this.allegiance === 'GM') return true;

    // you can see through invis with truesight
    if(char.hasEffect('Invisible') && !this.hasEffect('TrueSight')) return false;

    if(char.isPlayer() && !char.hasEffect('Hidden') && !char.hasEffect('ShadowMeld')) return true;

    if((<any>char).onlyVisibleTo && (<any>char).onlyVisibleTo !== this.uuid) return false;

    // +1 so we don't zero out stealth on tile
    const distFactor = Math.floor(this.distFrom(char) + 1);
    const otherStealth = char.getTotalStat('stealth');

    const thiefMultPerTile = char.baseClass === 'Thief' ? 0.2 : 0.05;

    const totalStealth = Math.floor(otherStealth + (otherStealth * distFactor * thiefMultPerTile));

    return this.getTotalStat('perception') >= totalStealth;
  }

  // implemented so npcs get the same check but it's 0 instead of a value
  public getBaseTraitLevel(trait: string): number {
    return 0;
  }

  public getTraitLevel(trait: string): number {
    return 0;
  }

  public getTraitLevelAndUsageModifier(trait: string): number {
    const level = this.getTraitLevel(trait);

    return TraitUsageModifiers.getTraitLevelAndUsageModifier(this, trait, level);
  }

  private adjustStatsForTraits(): void {

    // all traits
    this.totalStats.armorClass += this.getTraitLevelAndUsageModifier('NaturalArmor');

    // warrior traits
    this.totalStats.accuracy += this.getTraitLevelAndUsageModifier('EagleEye');
    this.totalStats.defense += this.getTraitLevelAndUsageModifier('FunkyMoves');
    this.totalStats.offense += this.getTraitLevelAndUsageModifier('SwordTricks');
    this.totalStats.magicalResist += this.getTraitLevelAndUsageModifier('HolyProtection');

    // mage & healer traits
    this.totalStats.mp += this.getTraitLevelAndUsageModifier('ManaPool');
    this.totalStats.mpregen += this.getTraitLevelAndUsageModifier('CalmMind');
  }

  public isUnableToAct(): boolean {
    const frozen = this.hasEffect('Frosted');
    const stunned = this.hasEffect('Stun');

    return get(frozen || {}, 'effectInfo.isFrozen', false) || stunned;
  }

  public changeAlignment(align: Alignment) {
    this.alignment = align;
    this.recalculateStats();
  }

  public isHostileTo(faction: Allegiance) {
    if(!this.allegianceReputation[faction]) return false;
    return this.allegianceReputation[faction] <= -100;
  }

  public isFriendlyTo(faction: Allegiance) {
    if(!this.allegianceReputation[faction]) return false;
    return this.allegianceReputation[faction] >= 100;
  }

  public isNeutralTo(faction: Allegiance) {
    if(!this.allegianceReputation[faction]) return true;
    return !this.isHostileTo(faction) && !this.isFriendlyTo(faction);
  }

  public allegianceAlignmentString(faction: Allegiance): string {
    if(this.isNeutralTo(faction)) return 'neutral';
    if(this.isFriendlyTo(faction)) return 'friendly';
    if(this.isHostileTo(faction)) return 'hostile';
  }

  public killAllPets() {
    if(!this.$$pets || this.$$pets.length === 0) return;
    this.$$pets.forEach(pet => pet.die(this, true));
  }

  public youDontSeeThatPerson(uuid: string): void {
    this.sendClientMessage('You do not see that person.');
  }

  public loseExpOrSkill(opts: { lostXPMin?: number, lostXPMax?: number, lostSkillMin?: number, lostSkillMax?: number }) {

    const { lostXPMin, lostXPMax, lostSkillMin, lostSkillMax } = opts;

    if(lostXPMin > 0 && lostXPMax > 0) {
      const lostXP = random(lostXPMin, lostXPMax);
      this.gainExp(-lostXP);
    }

    // lose a tiny bit of non-zero, non-tradeskill skills
    if(lostSkillMin > 0 && lostSkillMax > 0) {
      const skills = this.allSkills;
      const lostSkill = random(lostSkillMin, lostSkillMax);
      const lostSkillType = sample(filter(Object.keys(skills), skill => {
        return skills[skill] > 0 && !VALID_TRADESKILLS_HASH[skill];
      }));

      this._gainSkill(lostSkillType, -lostSkill);
    }
  }

  public setCombatTicks(ticks: number) {
    if(this.combatTicks > ticks) return;
    this.combatTicks = ticks;
  }
}
