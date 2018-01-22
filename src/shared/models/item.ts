
import { extend, omitBy, includes, without, isNumber, size, startCase, sample } from 'lodash';
import { toRoman } from 'roman-numerals';
import * as uuid from 'uuid/v4';
import { Alignment, Character, SkillClassNames } from './character';

import * as Effects from '../../server/effects';
import { nonenumerable } from 'nonenumerable';
import { LootHelper } from '../../server/helpers/loot-helper';

export const ValidItemTypes = [
  'Mace', 'Axe', 'Dagger', 'Wand', 'Onehanded', 'Twohanded', 'Polearm', 'Ranged',
  'Martial', 'Staff', 'Restoration', 'Conjuration', 'Throwing', 'Thievery', 'Shortsword'
];

export const WeaponClasses = [
  'Axe', 'Broadsword', 'Crossbow', 'Dagger', 'Club', 'Crossbow', 'Greataxe', 'Greatmace', 'Greatsword', 'Halberd', 'Longbow',
  'Longsword', 'Mace', 'Shield', 'Shortbow', 'Shortsword', 'Spear', 'Staff', 'Wand'
];

export const ShieldClasses = [
  'Shield'
];

export const ArmorClasses = [
  'Tunic', 'Breastplate', 'Fur', 'Fullplate'
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

export const MagicCutArmorClasses = ['Breastplate', 'Fullplate'];

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
  alignment?: Alignment;
  skill?: { name: string, level: number };
}

export class Encrust {
  desc: string;
  sprite: number;
  stats: any = {};
  value: number;
}

export enum Quality {
  POOR = 1,
  BELOW_AVERAGE = 2,
  AVERAGE = 3,
  ABOVE_AVERAGE = 4,
  PERFECT = 5
}

export class Item {
  @nonenumerable
  _id: any;

  name: string;
  desc: string;
  extendedDesc: string;
  sprite: number;
  itemClass: string;

  encrust?: Encrust;
  quality?: Quality;

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

  trait?: { name: string, level: number };

  enchantLevel: number;

  @nonenumerable
  searchItems: Item[];

  @nonenumerable
  tansFor: string;

  x: number;
  y: number;

  @nonenumerable
  $heldBy?: any;

  @nonenumerable
  $$isPlayerCorpse?: boolean;

  @nonenumerable
  $$playersHeardDeath?: string[];

  effect: any;

  succorInfo: { map: string, x: number, y: number, z: number };
  destroyOnDrop: boolean;

  containedItems?: Array<{ chance: number, result: string }>;
  expiresAt: number;

  daily?: boolean;

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

    const starText = this.quality - 2 > 0 ? Array(this.quality - 2).fill('★').join('') : '';

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

    const traitText = this.trait
                    && !includes(this.name, 'Rune Scroll')
                    && senseLevel > 0 ? `This item bestows the ability ${startCase(this.trait.name)} ${toRoman(this.trait.level)}. ` : '';

    const levelText = this.requirements && this.requirements.level ? `You must be level ${this.requirements.level} to use this item. ` : '';

    const encrustText = this.encrust ? ` set with ${this.encrust.desc}` : '';
    const baseText = `You are looking at ${this.desc}${encrustText}. `;
    const conditionText = `The item is in ${this.conditionString()} condition. `;

    const dualWieldText = this.offhand ? 'The item is lightweight enough to use in either hand. ' : '';

    const alignmentText = this.requirements && this.requirements.alignment ? `This item is ${this.requirements.alignment}. ` : '';

    const skillText = this.requirements && this.requirements.skill ? `This item requires ${this.requirements.skill.name} level ${this.requirements.skill.level}. ` : '';

    const canAppraise = player.baseClass === 'Thief' && player.calcSkillLevel(SkillClassNames.Thievery) >= 7;
    const appraiseText = canAppraise ? `The item is worth ${this.value} gold. ` : '';

    return `${starText} ${baseText}${sense1Text}${sense1AfterText}${sense2Text}${traitText}
    ${dualWieldText}${usesText}${fluidText}${levelText}${alignmentText}${skillText}
    ${conditionText}${ownedText}${appraiseText}`;
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

    let { level, profession, alignment, skill } = this.requirements;
    if(!level) level = 0;
    if(!profession) profession = [char.baseClass];
    if(!alignment) alignment = char.alignment;
    if(!skill) skill = { name: 'Martial', level: -1 };

    return baseCondition
        && level <= char.level
        && alignment === char.alignment
        && char.calcSkillLevel(skill.name) >= skill.level
        && includes(profession, char.baseClass);
  }

  hasCondition() {
    return this.condition > 0;
  }

  loseCondition(val = 1, onBreak = () => {}) {
    this.condition -= val;
    if(onBreak && this.condition <= 0) onBreak();
  }

  canUse(char: Character) {
    return (this.itemClass === 'Box' || this.effect || this.succorInfo || this.ounces > 0) && this.hasCondition() && this.isOwnedBy(char);
  }

  // < 0 means it lasts forever
  castAndTryBreak(): boolean {
    if(this.effect.uses < 0) return false;
    this.effect.uses--;
    return this.effect.uses === 0;
  }

  use(char: Character): boolean {
    if(!this.canUse(char)) return false;
    if(this.effect && (isNumber(this.ounces) ? this.ounces > 0 : true)) {
      // swallow effects that don't exist
      if(!Effects[this.effect.name]) return true;
      char.applyEffect(new Effects[this.effect.name](this.effect));
    }

    if(this.itemClass === 'Box') {
      if(this.containedItems.length === 0) return false;

      const containedItems = this.containedItems;
      this.containedItems = [];

      const hand = char.rightHand === this ? 'RightHand' : 'LeftHand';
      LootHelper.rollSingleTable(containedItems, char.$$room).then(items => {
        const setItem = items[0];
        char[`set${hand}`](setItem);

        if(setItem) {
          char.sendClientMessage(`You got ${setItem.desc} from the box!`);
        } else {
          char.sendClientMessage(`The box was empty!`);
        }

      });
    }

    return true;
  }
}
