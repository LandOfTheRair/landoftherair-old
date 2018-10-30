
import { Character, SkillClassNames, StatName } from '../../shared/models/character';
import { extend, includes, get, cloneDeep, isString } from 'lodash';
import { Skill } from './Skill';
import { CombatHelper } from '../helpers/world/combat-helper';
import { Item } from '../../shared/models/item';
import { MessageHelper } from '../helpers/world/message-helper';
import { RollerHelper } from '../../shared/helpers/roller-helper';

export const Maxes = {
  Lesser: 10,
  Bradley: 13,
  Minor: 15,
  Basic: 18,
  Greater: 21,
  Major: 24,
  Advanced: 27,
  Pure: 30
};

interface EffectInfo {
  damage?: number;
  caster: string;
  casterName?: string;
  isPermanent?: boolean;
  isFrozen?: boolean;
  canManuallyUnapply?: boolean;
  enrageTimer?: number;
}

export class Effect {

  name = '';
  iconData = {};
  duration = 0;
  charges?: number;
  autocast: boolean;
  protected tier: string;
  protected potency = 0;

  protected hasSkillRef: boolean;

  private statBoosts: { [key: string]: number };

  public get allBoosts() {
    return this.statBoosts;
  }

  public get setPotency(): number {
    return this.potency;
  }

  effectInfo: EffectInfo = { caster: '' };
  casterRef: any;

  public shouldNotShowMessage: boolean;
  public hasEnded: boolean;

  constructor(opts) {
    extend(this, cloneDeep(opts));
    if(!this.name) this.name = this.constructor.name;

    // set from a "base effect" on a creature
    if(get(this, 'effectInfo.isPermanent')) {
      this.flagPermanent('caster');
    }
  }

  protected resetStats(char: Character) {
    this.statBoosts = {};
    char.recalculateStats();
  }

  public gainStat(char: Character, stat: StatName, value: number) {
    this.statBoosts = this.statBoosts || {};
    this.statBoosts[stat] = this.statBoosts[stat] || 0;
    this.statBoosts[stat] += value;

    char.recalculateStats();
  }

  public loseStat(char: Character, stat: StatName, value: number) {
    this.gainStat(char, stat, -value);
  }

  public canBeUnapplied() {
    return this.effectInfo && this.effectInfo.canManuallyUnapply;
  }

  protected flagPermanent(casterUUID: string) {
    this.duration = -1;
    this.effectInfo.isPermanent = true;
    this.effectInfo.caster = casterUUID;
    this.effectInfo.canManuallyUnapply = false;
  }

  protected flagCasterName(casterName: string) {
    this.effectInfo.casterName = casterName;
  }

  protected flagUnapply(force = false) {
    if(this.effectInfo.isPermanent && !force) return;
    this.effectInfo.canManuallyUnapply = true;
  }

  protected aoeAgro(caster: Character, agro: number) {
    caster.$$room.state.getAllHostilesInRange(caster, 4).forEach(mon => {
      mon.addAgro(caster, agro);
    });
  }

  tick(char: Character) {
    this.effectTick(char);

    if(this.duration > 0) this.duration--;
    if(!this.effectInfo.isPermanent && this.duration <= 0) {
      char.unapplyEffect(this);
      this.effectEnd(char);
    }
  }

  effectTick(char: Character) {}
  effectStart(char: Character) {}
  effectEnd(char: Character) {}

  effectMessage(char: Character, message: string|any, shouldQueue = false) {
    if(!char || this.shouldNotShowMessage) return;
    char.sendClientMessage(message, shouldQueue);
  }

  effectMessageRadius(char: Character, message: string|any, radius = 4, ignore: string[] = []) {
    if(!char || this.shouldNotShowMessage) return;
    MessageHelper.sendClientMessageToRadius(char, message, radius, ignore);
  }

  skillFlag(caster) {
    if(caster.baseClass === 'Healer') return SkillClassNames.Restoration;
    if(caster.baseClass === 'Mage')   return SkillClassNames.Conjuration;
    if(caster.baseClass === 'Thief')  return SkillClassNames.Thievery;
    return caster.rightHand ? caster.rightHand.type : 'Martial';
  }

  magicalAttack(caster, ref, opts: any = {}) {
    opts.effect = this;
    if(opts.skillRef) {
      opts.skillRef.flagSkills = this.skillFlag(caster);
    }

    // trap casters do not have uuid
    if(!caster.uuid) caster = ref;

    CombatHelper.magicalAttack(caster, ref, opts);
  }
}

export class SpellEffect extends Effect {
  flagSkills = [];

  potencyMultiplier = 0;

  maxSkillForSkillGain = 0;
  skillMults: Array<number[]>;

  casterEffectMessage(char: Character, message: string|any) {
    super.effectMessage(char, isString(message) ? { message, subClass: 'spell buff give', sfx: 'spell-buff' } : message);
  }

  targetEffectMessage(char: Character, message: string|any) {
    super.effectMessage(char, isString(message) ? { message, subClass: 'spell buff get', sfx: 'spell-buff' } : message);
  }

  setPotencyAndGainSkill(caster: Character, skillRef?: Skill) {

    this.hasSkillRef = !!skillRef;

    // called from something like a trap
    if(this.casterRef) return;

    // pre-set potency
    if(this.potency) return;

    if(!this.potency && this.skillFlag && skillRef) {
      const flaggedSkill = this.skillFlag(caster);
      caster.flagSkill(flaggedSkill);

      this.potency = caster.calcSkillLevel(flaggedSkill) + 1;

      const canGainSkill = this.potency <= this.maxSkillForSkillGain;

      if(canGainSkill) {
        caster.gainSkill(flaggedSkill, 1);
      }

      if(caster.hasEffect('Encumbered')
      && includes([SkillClassNames.Conjuration, SkillClassNames.Restoration], flaggedSkill)) {
        caster.sendClientMessage('Your armor exhausts you as you try to cast your spell!');
        this.potency = Math.floor(this.potency / 2);
      }

      const dazed = caster.hasEffect('Daze');
      if(dazed && RollerHelper.XInOneHundred(dazed.setPotency)) {
        caster.sendClientMessage('You are completely unable to concentrate on casting your spell!');
        this.potency = 0;
      }

    } else {
      this.potency = 1;
    }

  }

  getMultiplier(): number {
    if(!this.hasSkillRef) return 1;

    let retMult = 0;

    this.skillMults.forEach(([skill, mult]) => {
      if(this.potency > skill) retMult = mult;
    });

    return retMult;
  }

  getCoreStat(caster: Character): number {
    if(!this.hasSkillRef) return 1;

    let base = 0;

    /** PERK:CLASS:HEALER:Healers use wis as their primary spellcasting stat. */
    if(caster.baseClass === 'Healer')   base = this.getCasterStat(caster, 'wis');

    /** PERK:CLASS:MAGE:Mages use int as their primary spellcasting stat. */
    if(caster.baseClass === 'Mage')     base = this.getCasterStat(caster, 'int');

    /** PERK:CLASS:THIEF:Thieves use dex as their primary spellcasting stat. */
    if(caster.baseClass === 'Thief')    base = this.getCasterStat(caster, 'dex');

    /** PERK:CLASS:WARRIOR:Warriors use str as their primary spellcasting stat. */
    if(caster.baseClass === 'Warrior')  base = this.getCasterStat(caster, 'str');

    return Math.max(1, base);
  }

  getTotalDamageDieSize(caster: Character): number {
    return Math.floor(this.getMultiplier() * this.getCoreStat(caster));
  }

  getTotalDamageRolls(caster: Character): number {
    let base = this.potency || 1;
    if(!caster) return 1;

    const rightHand = caster.rightHand;

    // check based on type, they're both technically wands
    /** PERK:CLASS:MAGE:Mages get a bonus to damage if they hold a wand in their right hand. */
    if(caster.baseClass === 'Mage' && rightHand && rightHand.itemClass === 'Wand' && rightHand.isOwnedBy(caster)) {
      base += rightHand.tier || 0;
    }

    /** PERK:CLASS:HEALER:Healers get a bonus to damage if they hold a totem in their right hand. */
    if(caster.baseClass === 'Healer' && rightHand && rightHand.itemClass === 'Totem' && rightHand.isOwnedBy(caster)) {
      base += rightHand.tier || 0;
    }

    if(caster && caster.baseClass === 'Thief' && caster.getTraitLevelAndUsageModifier) {
      base += caster.getTraitLevelAndUsageModifier('StrongerTraps');
    }

    return base;
  }

  updateDurationBasedOnTraits(caster: Character): void {
    let durationMultiplierBonus = 0;

    durationMultiplierBonus += caster.getTraitLevelAndUsageModifier('EffectiveSupporter');

    this.duration += Math.floor(this.duration * durationMultiplierBonus);
  }

  getCasterStat(caster, stat) {
    if(this.casterRef) return this.casterRef.casterStats[stat];

    return caster.getTotalStat(stat);
  }

  cast(caster: Character, target: Character, skillRef?: Skill) {}
}

export class ChanneledSpellEffect extends SpellEffect {

  cast(char: Character, target: Character, skillRef?: Skill) {

    // only one stance can be active at a time
    char.effectsList.forEach(eff => {
      if(!includes(eff.constructor.name, 'Channel')) return;
      char.unapplyEffect(eff, true);
    });

  }
}

export class ImbueEffect extends SpellEffect {

  cast(char: Character, target: Character, skillRef?: Skill): boolean {
    let foundSelf = false;

    // only one imbue can be active at a time
    char.effectsList.forEach(eff => {
      if(!includes(eff.constructor.name, 'Imbue')) return;
      if(eff.effectInfo.isPermanent) return;

      char.unapplyEffect(eff, true);
      if(eff.constructor.name === this.constructor.name) foundSelf = true;
    });

    return foundSelf;
  }
}

export class WeaponEffect extends Effect {

  protected skillRequired: number;

  static isValid(char: Character, weaponClass: string, skillRequired: number): boolean {

    // always valid for npcs
    if(!char.isPlayer()) return true;

    const item = char.rightHand;
    const itemType = get(item, 'type', 'Martial');
    if(itemType !== weaponClass) return false;
    if(item && item.twoHanded && char.leftHand) return false;
    if(char.calcSkillLevel(itemType) < skillRequired) return false;
    return true;
  }
}

export class StanceEffect extends WeaponEffect {

  public weaponClass: string;

  cast(char: Character, target: Character, skillRef?: Skill): boolean {
    this.weaponClass = get(char.rightHand, 'type', 'Martial');

    let foundSelf = false;

    // only one stance can be active at a time
    char.effectsList.forEach(eff => {
      if(!includes(eff.constructor.name, 'Stance')) return;
      char.unapplyEffect(eff, true);
      if(eff.constructor.name === this.constructor.name) foundSelf = true;
    });

    return foundSelf;
  }

  tick(char: Character) {
    super.tick(char);

    if(!StanceEffect.isValid(char, this.weaponClass, this.skillRequired)) {
      char.unapplyEffect(this, true);
    }
  }
}

export class BuildupEffect extends SpellEffect {
  public buildupCur = 0;
  public buildupMax = 100;
  public buildupDamage = 0;
  public decayRate = 3;

  effectTick(char: Character) {
    if(this.buildupCur >= this.buildupMax) {
      this.buildupProc(char);
      char.unapplyEffect(this);
    }

    this.buildupCur -= Math.max(1, this.decayRate);

    if(this.buildupCur <= 0) {
      char.unapplyEffect(this);
    }
  }

  buildupProc(char: Character) {}
}

export interface AugmentSpellEffect {
  augmentAttack(attacker: Character, defender: Character, opts: { damage: number, damageClass: string });
}

export interface AttributeEffect {
  modifyDamage(attacker: Character, defender: Character, opts: { attackerWeapon: Item, damage: number, damageClass: string });
}

export interface OnHitEffect {
  onHit(attacker: Character, defender: Character, opts: { damage: number, damageClass: string });
}
