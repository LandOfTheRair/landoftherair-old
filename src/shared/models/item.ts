import { cloneDeep, extend, get, includes, isNumber, isUndefined, size, startCase, find } from 'lodash';
import { toRoman } from 'roman-numerals';
import * as uuid from 'uuid/v4';

import * as Effects from '../../server/effects';
import { nonenumerable } from 'nonenumerable';
import { LootHelper } from '../../server/helpers/world/loot-helper';
import { ICharacter, SkillClassNames, Stats } from '../interfaces/character';
import {
  DamageType,
  Encrust,
  IItem,
  ItemCosmetic,
  ItemEffect,
  ItemRequirements,
  Quality,
} from '../interfaces/item';

export class Item implements IItem {
  @nonenumerable
  _id?: any;

  name: string;
  desc?: string;
  extendedDesc?: string;
  sprite?: number;
  itemClass: string;
  createdAt?: number;

  encrust?: Encrust;
  quality?: Quality;
  damageClass?: DamageType;
  cosmetic?: ItemCosmetic;

  uuid?: string;

  // username ref
  owner?: string;

  tier: number;

  ounces?: number;
  value? = 0;
  maxEncrusts?: number;
  _buybackValue?: number;
  sellValue?: number;
  stats?: Stats = {};
  requirements?: ItemRequirements;
  condition? = 20000;
  type? = 'Martial';
  secondaryType?: string;

  twoHanded?: boolean;
  proneChance?: number;

  isBeltable?: boolean;
  isSackable? = true;

  attackRange?: number;
  offhand?: boolean;
  returnsOnThrow?: boolean;
  binds?: boolean;
  tellsBind?: boolean;

  isHeavy?: boolean;
  canShoot?: boolean;
  shots?: number;
  trapUses?: number;

  trait?: { name: string, level: number };

  bookPage?: number;
  bookPages?: Array<{ id: string, text: string }>;
  bookItemFilter?: string;
  bookCurrentPage?: number;
  bookFindablePages?: number;

  enchantLevel?: number;

  @nonenumerable
  searchItems?: IItem[];

  @nonenumerable
  tansFor?: string;

  x?: number;
  y?: number;

  @nonenumerable
  $heldBy?: any;

  @nonenumerable
  $$isPlayerCorpse?: boolean;

  @nonenumerable
  $$playersHeardDeath?: string[];

  effect?: ItemEffect;

  succorInfo?: { map: string, x: number, y: number, z: number };
  destroyOnDrop?: boolean;

  containedItems?: Array<{ chance: number, result: string }>;
  expiresAt?: number;
  notUsableAfterHours?: number;

  daily?: boolean;
  previousUpgrades?: any[];

  constructor(opts, extraOpts: { doRegenerate?: boolean } = {}) {
    if(extraOpts.doRegenerate) {
      opts = cloneDeep(opts);
      opts.uuid = null;
    }

    extend(this, opts);
    if(!this.uuid) this.uuid = uuid();
    if(!this.createdAt) this.createdAt = Date.now();
    if(!this.value && this.sellValue) this.value = this.sellValue;
  }

  isBroken(): boolean {
    return this.condition <= 0;
  }

  usesString(): string {
    if(!this.effect || !this.effect.uses || this.effect.uses < 0) return '';
    const uses = this.effect.uses;

    if(uses < 3)    return 'looks brittle';
    if(uses < 9)    return 'looks cracked';
    if(uses < 20)   return 'looks normal';
    if(uses < 50)   return 'surges with energy';
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

  setOwner(player: ICharacter) {
    this.owner = player.uuid;
  }

  descTextFor(player: ICharacter, senseLevel = 0, fromClient = false) {

    const starText = this.quality - 2 > 0 ? Array(this.quality - 2).fill('★').join('') : '';

    const isValuableText = this.sellValue ? 'It looks valuable. ' : '';

    let ownedText = '';
    if(this.owner) {
      if(this.owner === (<any>player).username) ownedText = 'This item belongs to you. ';
      else                                      ownedText = 'This item does NOT belong to you. ';
    }

    let fluidText = this.itemClass === 'Bottle' && this.ounces > 0 ? `It is filled with ${this.ounces}oz of fluid. ` : '';
    if(this.itemClass === 'Bottle' && this.ounces === 0) fluidText = 'It is empty.';

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

      const stats = cloneDeep(this.stats);
      if(this.encrust && this.encrust.stats) {
        Object.keys(this.encrust.stats).forEach(key => {
          stats[key] = stats[key] || 0;
          stats[key] += this.encrust.stats[key];
        });
      }

      statText = Object.keys(stats)
        .filter(x => stats[x] && x !== 'effect')
        .map(x => `${stats[x] < 0 ? '' : '+'}${stats[x]} ${x.toUpperCase()}`)
        .join(', ');

      statText = statText ? `Hidden Bonuses: ${statText}` : '';
      if(fromClient && statText) statText = `<br><br>${statText}`;
    }

    return `${starText} ${baseText}${isValuableText}${sense1Text}${sense1AfterText}${sense2Text}${traitText}
    ${dualWieldText}${usesText}${fluidText}${levelText}${alignmentText}${skillText}
    ${conditionText}${ownedText}${appraiseText}${usefulText}${statText}`;
  }

  isOwnedBy(char: ICharacter): boolean {
    return (!this.owner || this.owner && (<any>char).username === this.owner) && this.canUseExpiration();
  }

  canUseExpiration(): boolean {
    if(isUndefined(this.notUsableAfterHours)) return true;
    const date = new Date(this.createdAt);
    date.setHours(date.getHours() + this.notUsableAfterHours);
    return +date > Date.now();
  }

  canUseInCombat(char: ICharacter): boolean {
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
        && char.calcBaseSkillLevel(skill.name) >= skill.level
        && includes(profession, char.baseClass);
  }

  hasCondition(): boolean {
    return this.condition > 0;
  }

  loseCondition(val = 1, onBreak: Function = () => {}): void {
    this.condition -= val;
    if(onBreak && this.condition <= 0) onBreak();
  }

  canUse(char: ICharacter): boolean {
    return (this.itemClass === 'Box' || (this.itemClass === 'Book' && this.bookItemFilter) || this.effect || this.succorInfo || this.ounces >= 0)
      && this.itemClass !== 'Trap'
      && this.hasCondition()
      && this.isOwnedBy(char);
  }

  // < 0 means it lasts forever
  castAndTryBreak(): boolean {
    if(this.effect.uses < 0 || this.itemClass === 'Trap') return false;
    this.effect.uses--;
    return this.effect.uses === 0;
  }

  use(char: ICharacter, fromApply = false): boolean {
    if(fromApply) return true;
    if(!this.canUse(char)) return false;
    const hand = char.rightHand === this ? 'RightHand' : 'LeftHand';

    if(this.effect && (isNumber(this.ounces) ? this.ounces !== 0 : true)) {
      // swallow effects that don't exist
      if(!Effects[this.effect.name]) return true;
      const eff = new Effects[this.effect.name](this.effect);

      if(eff.cast) {
        eff.cast(char, char);
      } else {
        char.applyEffect(eff);
      }
    }

    if(this.effect && this.effect.uses) {
      if(this.castAndTryBreak()) {
        char.sendClientMessage('Your item has fizzled and turned to dust.');
        char[`set${hand}`](null);
      }
    }

    if(this.itemClass === 'Book') {
      if(!this.bookItemFilter) return false;

      this.handleBook(char);
    }

    if(this.itemClass === 'Box') {
      this.handleBox(char, hand);
    }

    return true;
  }

  private handleBook(char: ICharacter) {
    const pageIndexes = char.$$room.npcLoader.getItemsFromPlayerSackByName(char, this.bookItemFilter, true);

    if(pageIndexes.length === 0) {
      char.sendClientMessage('No new pages were found in your sack.');
      return;
    }

    this.bookPages = this.bookPages || [];
    delete this.destroyOnDrop;

    const takeIndexes = [];
    pageIndexes.forEach(idx => {
      const item = char.sack.getItemFromSlot(idx);

      // if it fits into a specific page, we put it there
      if(isNumber(item.bookPage)) {
        if(!this.bookPages[item.bookPage]) {
          takeIndexes.push(idx);
          this.bookPages[item.bookPage] = { id: item.name, text: item.extendedDesc };
        }

      // if it does not have a specific page...
      } else {

        // first, we check for an old one matching the id, and try to update it
        const prevPage = find(this.bookPages, { id: item.name });
        if(prevPage) {
          if(prevPage.text === item.extendedDesc) return;

          prevPage.text = item.extendedDesc;

        // but if it doesn't exist, we just push it
        } else {
          this.bookPages.push({ id: item.name, text: item.extendedDesc });
        }

        takeIndexes.push(idx);
      }
    });

    char.$$room.npcLoader.takeItemsFromPlayerSack(char, takeIndexes);

    char.sendClientMessage(`Found ${takeIndexes.length} new or updated pages in your sack.`);
  }

  private handleBox(char: ICharacter, hand: string) {
    if(this.containedItems.length === 0) return false;

    const containedItems = this.containedItems;
    this.containedItems = [];

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

  public hasPageCount(total: number): boolean {
    if(!this.bookPages) return false;

    const filteredTotal = this.bookPages.filter(x => x);
    return filteredTotal.length >= total;
  }
}
