
import { extend, includes, isNumber, size, startCase, get, isUndefined, cloneDeep } from 'lodash';
import { toRoman } from 'roman-numerals';
import * as uuid from 'uuid/v4';
import { Alignment, Character, SkillClassNames } from './character';

import * as Effects from '../../server/effects';
import { nonenumerable } from 'nonenumerable';
import { LootHelper } from '../../server/helpers/world/loot-helper';

export type DamageType =
  'physical'
| 'necrotic'
| 'fire'
| 'ice'
| 'water'
| 'energy'
| 'poison'
| 'disease';

export const ValidItemTypes = [
  'Mace', 'Axe', 'Dagger', 'Wand', 'Onehanded', 'Twohanded', 'Polearm', 'Ranged',
  'Martial', 'Staff', 'Restoration', 'Conjuration', 'Throwing', 'Thievery', 'Shortsword'
];

export const WeaponClasses = [
  'Axe', 'Broadsword', 'Crossbow', 'Dagger', 'Club', 'Flail', 'Greataxe', 'Greatmace', 'Greatsword', 'Hammer', 'Halberd', 'Longbow',
  'Longsword', 'Mace', 'Saucer', 'Shield', 'Shortbow', 'Shortsword', 'Spear', 'Staff', 'Totem', 'Wand'
];

export const SharpWeaponClasses = [
  'Axe', 'Broadsword', 'Crossbow', 'Dagger', 'Greataxe', 'Greatsword', 'Halberd', 'Longbow', 'Longsword', 'Shortbow', 'Shortsword', 'Spear'
];

export const ShieldClasses = [
  'Shield', 'Saucer'
];

export const ArmorClasses = [
  'Tunic', 'Breastplate', 'Fur', 'Fullplate', 'Scaleplate'
];

export const RobeClasses = [
  'Cloak', 'Robe'
];

export const HeadClasses = [
  'Helm', 'Skull', 'Saucer'
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
  alignment?: Alignment;
  skill?: { name: string, level: number };
}

export class Encrust {
  name?: string;
  desc: string;
  sprite: number;
  stats: any = {};
  value: number;
  maxEncrusts?: number;
}

export class ItemEffect {
  name: string;
  tier: string;
  chance?: number;
  potency: number;
  uses?: number;
  autocast?: boolean;
  canApply?: boolean;
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
  createdAt: number;

  encrust?: Encrust;
  quality?: Quality;
  damageClass?: DamageType;

  uuid?: string;

  // username ref
  owner?: string;

  tier: number;

  ounces: number;
  value = 0;
  maxEncrusts?: number;
  _buybackValue?: number;
  stats: any = {};
  requirements?: ItemRequirements;
  condition = 20000;
  type = 'Martial';
  secondaryType: string;

  twoHanded: boolean;
  proneChance: number;

  isBeltable: boolean;
  isSackable = true;

  attackRange: number;
  offhand: boolean;
  returnsOnThrow: boolean;
  binds: boolean;
  tellsBind: boolean;

  isHeavy: boolean;

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

  effect: ItemEffect;

  succorInfo: { map: string, x: number, y: number, z: number };
  destroyOnDrop: boolean;

  containedItems?: Array<{ chance: number, result: string }>;
  expiresAt: number;
  notUsableAfterHours: number;

  daily?: boolean;
  previousUpgrades?: any[];

  constructor(opts, extraOpts: { doRegenerate?: boolean } = {}) {
    if(extraOpts.doRegenerate) {
      opts = cloneDeep(opts);
      this.regenerateUUID();
    }

    extend(this, opts);
    if(!this.uuid) this.uuid = uuid();
    if(!this.createdAt) this.createdAt = Date.now();
  }

  private regenerateUUID() {
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

  descTextFor(player: Character, senseLevel = 0, fromClient = false) {

    const starText = this.quality - 2 > 0 ? Array(this.quality - 2).fill('★').join('') : '';

    let ownedText = '';
    if(this.owner) {
      if(this.owner === (<any>player).username) ownedText = 'This item belongs to you. ';
      else                                      ownedText = 'This item does NOT belong to you. ';
    }

    const fluidText = this.itemClass === 'Bottle' &&  this.ounces > 0 ? `It is filled with ${this.ounces}oz of fluid. ` : '';
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

    const encrustText = this.encrust && this.encrust.desc ? ` set with ${this.encrust.desc}` : '';
    const ozText = this.itemClass !== 'Bottle' && this.ounces > 0 ? `${this.ounces}oz of ` : '';
    const baseText = `You are looking at ${ozText}${this.desc}${encrustText}. `;
    const conditionText = `The item is in ${this.conditionString()} condition. `;

    const dualWieldText = this.offhand ? 'The item is lightweight enough to use in either hand. ' : '';

    const alignmentText = this.requirements && this.requirements.alignment ? `This item is ${this.requirements.alignment}. ` : '';

    const formattedSkill = get(this, 'requirements.skill.name') === 'Wand' ? 'Magical Weapons' : get(this, 'requirements.skill.name');
    const skillText = this.requirements && this.requirements.skill ? `This item requires ${formattedSkill} skill ${this.requirements.skill.level}. ` : '';

    const thiefSkill = player.calcSkillLevel(SkillClassNames.Thievery);
    const conjSkill = player.calcSkillLevel(SkillClassNames.Conjuration);

    /** PERK:CLASS:THIEF:Thieves can automatically appraise items by double clicking them after skill 7. */
    const canAppraise = player && player.baseClass === 'Thief' && thiefSkill >= 7;
    const appraiseText = canAppraise ? `The item is worth ${this.value} gold. ` : '';

    const usefulText = this.canUseExpiration() ? '' : `This item does not appear useful anymore. `;

    let statText = '';
    if(thiefSkill >= 10 || conjSkill >= 20) {
      statText = Object.keys(this.stats)
        .map(x => `${this.stats[x] < 0 ? '' : '+'}${this.stats[x]} ${x.toUpperCase()}`)
        .join(', ');

      statText = `Hidden Bonuses: ${statText}`;
      if(fromClient) statText = `<br><br>${statText}`;
    }

    return `${starText} ${baseText}${sense1Text}${sense1AfterText}${sense2Text}${traitText}
    ${dualWieldText}${usesText}${fluidText}${levelText}${alignmentText}${skillText}
    ${conditionText}${ownedText}${appraiseText}${usefulText}${statText}`;
  }

  isOwnedBy(char: Character): boolean {
    return (!this.owner || this.owner && (<any>char).username === this.owner) && this.canUseExpiration();
  }

  canUseExpiration(): boolean {
    if(isUndefined(this.notUsableAfterHours)) return true;
    const date = new Date(this.createdAt);
    date.setHours(date.getHours() + this.notUsableAfterHours);
    return +date > Date.now();
  }

  canUseInCombat(char: Character): boolean {
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

  hasCondition(): boolean {
    return this.condition > 0;
  }

  loseCondition(val = 1, onBreak = () => {}): void {
    this.condition -= val;
    if(onBreak && this.condition <= 0) onBreak();
  }

  canUse(char: Character): boolean {
    return (this.itemClass === 'Box' || this.effect || this.succorInfo || this.ounces > 0) && this.hasCondition() && this.isOwnedBy(char);
  }

  // < 0 means it lasts forever
  castAndTryBreak(): boolean {
    if(this.effect.uses < 0) return false;
    this.effect.uses--;
    return this.effect.uses === 0;
  }

  use(char: Character, fromApply = false): boolean {
    if(fromApply) return true;
    if(!this.canUse(char)) return false;
    if(this.effect && (isNumber(this.ounces) ? this.ounces > 0 : true)) {
      // swallow effects that don't exist
      if(!Effects[this.effect.name]) return true;
      const eff = new Effects[this.effect.name](this.effect);

      if(eff.cast) {
        eff.cast(char, char);
      } else {
        char.applyEffect(eff);
      }
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
