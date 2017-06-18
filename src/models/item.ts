
import { extend, omitBy, includes, without } from 'lodash';
import * as uuid from 'uuid/v4';
import { Player } from './player';

export const ValidItemTypes = [
  'Mace', 'Axe', 'Dagger', 'Wand', 'Onehanded', 'Twohanded', 'Polearm', 'Ranged',
  'Martial', 'Staff', 'Restoration', 'Conjuration', 'Throwing', 'Thievery', 'Shortsword'
];

export const WeaponClasses = [
  'Dagger', 'Halberd', 'Club', 'Crossbow', 'Greatsword', 'Longbow', 'Longsword', 'Shortbow', 'Shortsword', 'Staff',
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

  armorClass = 0;
  accuracy = 0;
  baseDamage = 5;
  offense = 0;
  defense = 0;

  ounces = 0;
  value = 0;
  stats: any = {};
  requirements?: ItemRequirements;
  condition: number = 20000;
  type = 'Martial';

  twoHanded = false;

  isBeltable = false;
  isSackable = true;

  searchItems: Item[];
  tansFor: string;

  x: number;
  y: number;

  $heldBy;

  constructor(opts) {
    extend(this, opts);
    if(!this.uuid) this.uuid = uuid();
  }

  get conditionString() {
    if(this.condition <= 0)     return 'broken';
    if(this.condition <= 5000)  return 'tattered';
    if(this.condition <= 10000) return 'below average';
    if(this.condition <= 20000) return 'average';
    if(this.condition <= 30000) return 'above average';
    if(this.condition <= 40000) return 'mint';
    if(this.condition <= 50000) return 'above mint';
    return 'perfect';
  }

  descTextFor(player: Player) {
    let ownedText = '';
    if(this.owner) {
      if(this.owner === player.username) ownedText = 'This item belongs to you.';
      else                               ownedText = 'This item does not belong to you.';
    }

    const fluidText = this.ounces > 0 ? `It is filled with ${this.ounces}oz of fluid. ` : '';

    return `You are looking at ${this.desc}. ${fluidText}The item is in ${this.conditionString} condition. ${ownedText}`;
  }

  isRobe() {
    return EquipHash[this.itemClass] === 'Robe';
  }

  isArmor() {
    return EquipHash[this.itemClass] === 'Armor';
  }

  toJSON() {
    return omitBy(this, (value, key) => {
      if(!Object.getOwnPropertyDescriptor(this, key)) return true;
      if(key === '_id' || key === '$heldBy') return true;
      return false;
    });
  }
}
