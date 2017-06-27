
import { extend, omitBy, includes, without } from 'lodash';
import * as uuid from 'uuid/v4';
import { Player } from './player';
import { Character } from './character';

import * as Effects from '../server/effects';
import { Logger } from '../server/logger';

export const ValidItemTypes = [
  'Mace', 'Axe', 'Dagger', 'Wand', 'Onehanded', 'Twohanded', 'Polearm', 'Ranged',
  'Martial', 'Staff', 'Restoration', 'Conjuration', 'Throwing', 'Thievery', 'Shortsword'
];

export const WeaponClasses = [
  'Axe', 'Crossbow', 'Dagger', 'Club', 'Crossbow', 'Greataxe', 'Greatmace', 'Greatsword', 'Halberd', 'Longbow',
  'Longsword', 'Mace', 'Shield', 'Shortbow', 'Shortsword', 'Staff', 'Wand'
];

export const ShieldClasses = [
  'Shield'
];

export const ArmorClasses = [
  'Tunic', 'Breastplate'
];

export const RobeClasses = [
  'Cloak'
];

export const HeadClasses = [
  'Helm', 'Skull'
];

export const NeckClasses = [
  'Amulet'
];

export const WaistClasses = [
  'Sash'
];

export const WristsClasses = [
  'Bracers'
];

export const RingClasses = [
  'Ring'
];

export const FeetClasses = [
  'Boots'
];

export const HandsClasses = [
  'Gloves'
];

export const EarClasses = [
  'Earring'
];

export const EquipHash = {};
ArmorClasses.forEach(t => EquipHash[t] = 'Armor');
RobeClasses.forEach(t => EquipHash[t] = 'Robe');
HeadClasses.forEach(t => EquipHash[t] = 'Head');
NeckClasses.forEach(t => EquipHash[t] = 'Neck');
WaistClasses.forEach(t => EquipHash[t] = 'Waist');
WristsClasses.forEach(t => EquipHash[t] = 'Wrists');
RingClasses.forEach(t => EquipHash[t] = 'Ring');
FeetClasses.forEach(t => EquipHash[t] = 'Feet');
HandsClasses.forEach(t => EquipHash[t] = 'Hands');
EarClasses.forEach(t => EquipHash[t] = 'Ear');

export const GivesBonusInHandItemClasses = WeaponClasses.concat(NeckClasses);

export const EquippableItemClasses = HeadClasses
  .concat(NeckClasses)
  .concat(WaistClasses)
  .concat(WristsClasses)
  .concat(RingClasses)
  .concat(FeetClasses)
  .concat(HandsClasses)
  .concat(ArmorClasses)
  .concat(RobeClasses)
  .concat(EarClasses);

export const EquippableItemClassesWithWeapons = EquippableItemClasses
  .concat(WeaponClasses);

/* TODO Eventually:

  - items that have an xp value, xp max, level, value, level max, and stat growth per item level
  - items that can only grow by killing certain mobs
  - items that have stats that grow based on the player level
  - items that have random stats assigned to them
  - items that boost skills
 */

export class ItemRequirements {
  level?: number;
  class?: string[];
}

export class Item {
  name: string;
  desc: string;
  extendedDesc: string;
  sprite: number;
  itemClass: string;

  uuid?: string;

  // username ref
  owner?: string;

  baseDamage = 0;
  maxDamage = 0;

  ounces = 0;
  value = 0;
  _buybackValue?: number;
  stats: any = {};
  requirements?: ItemRequirements;
  condition = 20000;
  type = 'Martial';
  secondaryType: string;

  twoHanded = false;

  isBeltable = false;
  isSackable = true;

  attackRange = 0;
  returnsOnThrow: boolean;
  binds: boolean;

  searchItems: Item[];
  tansFor: string;

  x: number;
  y: number;

  $heldBy;

  effect: any;

  expiresAt: number;

  constructor(opts) {
    extend(this, opts);
    if(!this.uuid) this.uuid = uuid();
  }

  regenerateUUID() {
    this.uuid = uuid();
  }

  conditionString(): string {
    if(this.condition <= 0)     return 'broken';
    if(this.condition <= 5000)  return 'tattered';
    if(this.condition <= 10000) return 'below average';
    if(this.condition <= 20000) return 'average';
    if(this.condition <= 30000) return 'above average';
    if(this.condition <= 40000) return 'mint';
    if(this.condition <= 50000) return 'above mint';
    return 'perfect';
  }

  setOwner(player: Character) {
    this.owner = player.uuid;
  }

  descTextFor(player: Character, senseLevel = 0) {
    let ownedText = '';
    if(this.owner) {
      if(this.owner === (<any>player).username) ownedText = 'This item belongs to you.';
      else                                      ownedText = 'This item does NOT belong to you.';
    }

    const fluidText = this.ounces > 0 ? `It is filled with ${this.ounces}oz of fluid. ` : '';

    const sense1Text = senseLevel > 0 && this.extendedDesc ? `This item is ${this.extendedDesc}. ` : '';
    let sense1AfterText = '';
    if(senseLevel > 0 && this.stats.offense > 0 || this.stats.defense > 0) {
      sense1AfterText = `The combat adds are ${this.stats.offense || 0}/${this.stats.defense || 0}. `;
    }

    let sense2Text = '';
    if(senseLevel > 1 && this.effect && this.itemClass !== 'Bottle') {
      sense2Text = `This item has on-contact ${this.effect.name}`;
      sense2Text = this.effect.potency ? `${sense2Text} with a potency of ${this.effect.potency}. ` : `${sense2Text}. `;
    }

    return `You are looking at ${this.desc}. ${sense1Text}${sense1AfterText}${sense2Text}${fluidText}The item is in ${this.conditionString()} condition. ${ownedText}`;
  }

  isRobe() {
    return EquipHash[this.itemClass] === 'Robe';
  }

  isArmor() {
    return EquipHash[this.itemClass] === 'Armor';
  }

  isOwnedBy(char: Character) {
    return !this.owner || this.owner && (<any>char).username === this.owner;
  }

  canUse(char: Character) {
    return this.effect && this.isOwnedBy(char);
  }

  use(char: Character) {
    if(!this.canUse(char)) return false;
    if(this.effect) {
      if(!Effects[this.effect.name]) {
        Logger.error(new Error(`Error: Effect ${this.effect.name} does not exist.`));
        return false;
      }

      char.applyEffect(new Effects[this.effect.name](this.effect));
    }

    return true;
  }

  toJSON() {
    return omitBy(this, (value, key) => {
      if(!Object.getOwnPropertyDescriptor(this, key)) return true;
      if(key === '_id' || key === '$heldBy') return true;
      return false;
    });
  }
}
