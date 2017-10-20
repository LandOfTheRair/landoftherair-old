
import { extend, omitBy, includes, without, isNumber, size } from 'lodash';
import * as uuid from 'uuid/v4';
import { Character, SkillClassNames } from './character';

import * as Effects from '../../server/effects';

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
  'Tunic', 'Breastplate', 'Fur'
];

export const RobeClasses = [
  'Cloak', 'Robe'
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
  'Gloves', 'Claws'
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

export class ItemRequirements {
  level?: number;
  profession?: string[];
}

export class Encrust {
  desc: string;
  sprite: number;
  stats: any = {};
}

export class Item {
  name: string;
  desc: string;
  extendedDesc: string;
  sprite: number;
  itemClass: string;

  encrust?: Encrust;

  uuid?: string;

  // username ref
  owner?: string;

  damageRolls = 0;
  baseDamage = 0;
  minDamage = 0;
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
  proneChance = 0;

  isBeltable = false;
  isSackable = true;

  attackRange = 0;
  offhand: boolean;
  returnsOnThrow: boolean;
  binds: boolean;
  tellsBind: boolean;

  searchItems: Item[];
  tansFor: string;

  x: number;
  y: number;

  $heldBy?: any;
  $$isPlayerCorpse?: boolean;
  $$playersHeardDeath?: string[];

  effect: any;

  expiresAt: number;

  constructor(opts) {
    extend(this, opts);
    if(!this.uuid) this.uuid = uuid();
  }

  regenerateUUID() {
    this.uuid = uuid();
  }

  usesString(): string {
    if(!this.effect || !this.effect.uses || this.effect.uses < 0) return '';
    const uses = this.effect.uses;

    if(uses < 3)    return 'looks brittle';
    if(uses < 9)    return 'looks cracked';
    if(uses < 20)   return 'looks normal';
    if(uses < 50)   return 'looks energetic';
    if(uses < 100)  return 'crackles with power';

    return 'is flawlessly vibrant';

    // the item <x>
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

  conditionACModifier(): number {
    if(this.condition <= 0)     return -3;
    if(this.condition <= 5000)  return -2;
    if(this.condition <= 10000) return -1;
    if(this.condition <= 20000) return 0;
    if(this.condition <= 30000) return 1;
    if(this.condition <= 40000) return 2;
    if(this.condition <= 50000) return 3;
    return 4;
  }

  setOwner(player: Character) {
    this.owner = player.uuid;
  }

  descTextFor(player: Character, senseLevel = 0) {
    let ownedText = '';
    if(this.owner) {
      if(this.owner === (<any>player).username) ownedText = 'This item belongs to you. ';
      else                                      ownedText = 'This item does NOT belong to you. ';
    }

    const fluidText = this.ounces > 0 ? `It is filled with ${this.ounces}oz of fluid. ` : '';
    let usesText = this.usesString();
    usesText = usesText ? `The item ${usesText}. ` : '';

    const sense1Text = senseLevel > 0 && this.extendedDesc ? `This item is ${this.extendedDesc}. ` : '';
    let sense1AfterText = '';
    if(senseLevel > 0 && (this.stats.offense > 0 || this.stats.defense > 0)) {
      sense1AfterText = `The combat adds are ${this.stats.offense || 0}/${this.stats.defense || 0}. `;
    }

    let sense2Text = '';
    if(senseLevel > 1 && this.effect && this.itemClass !== 'Bottle') {
      sense2Text = `This item has ${this.effect.uses ? 'castable' : 'on-contact'} ${this.effect.name}`;
      sense2Text = this.effect.potency ? `${sense2Text} with a potency of ${this.effect.potency}. ` : `${sense2Text}. `;
    }

    if(senseLevel > 1 && size(this.stats) > 0) {
      sense2Text = `${sense2Text ? `${sense2Text} ` : ''}This item affects physical attributes! `;
    }

    const levelText = this.requirements && this.requirements.level ? `You must be level ${this.requirements.level} to use this item. ` : '';

    const encrustText = this.encrust ? ` set with ${this.encrust.desc}` : '';
    const baseText = `You are looking at ${this.desc}${encrustText}. `;
    const conditionText = `The item is in ${this.conditionString()} condition. `;

    const dualWieldText = this.offhand ? 'The item is lightweight enough to use in either hand. ' : '';

    const canAppraise = player.baseClass === 'Thief' && player.calcSkillLevel(SkillClassNames.Thievery) >= 7;
    const appraiseText = canAppraise ? `The item is worth ${this.value} gold. ` : '';

    return `${baseText}${sense1Text}${sense1AfterText}${sense2Text}${dualWieldText}${usesText}${fluidText}${levelText}${conditionText}${ownedText}${appraiseText}`;
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

  canUseInCombat(char: Character) {
    const baseCondition = this.isOwnedBy(char) && this.hasCondition();
    if(!this.requirements) return baseCondition;

    let { level, profession } = this.requirements;
    if(!level) level = 0;
    if(!profession) profession = [char.baseClass];

    return baseCondition
        && level < char.level
        && includes(profession, char.baseClass);
  }

  hasCondition() {
    return this.condition > 0;
  }

  loseCondition(val = 1, onBreak = () => {}) {
    this.condition -= val;
    if(onBreak && this.condition <= 0) onBreak();
  }

  canUse(char: Character) {``
    return (this.effect || this.ounces > 0) && this.hasCondition() && this.isOwnedBy(char);
  }

  // < 0 means it lasts forever
  castAndTryBreak() {
    if(this.effect.uses < 0) return false;
    this.effect.uses--;
    return this.effect.uses === 0;
  }

  use(char: Character) {
    if(!this.canUse(char)) return false;
    if(this.effect && (isNumber(this.ounces) ? this.ounces > 0 : true)) {
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
