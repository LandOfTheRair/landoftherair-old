
import { Character, SkillClassNames } from '../../shared/models/character';
import { extend, includes, get } from 'lodash';
import { Skill } from './Skill';
import { CombatHelper } from '../helpers/world/combat-helper';
import { Item, MagicCutArmorClasses } from '../../shared/models/item';

export const Maxes = {
  Lesser: 10,
  Bradley: 13,
  Minor: 15,
  Basic: 20
};

interface EffectInfo {
  damage?: number;
  caster: string;
  casterName?: string;
  isPermanent?: boolean;
  isFrozen?: boolean;
  canManuallyUnapply?: boolean;
}

export class Effect {

  name = '';
  iconData = {};
  duration = 0;
  protected tier: string;
  protected potency = 0;

  protected hasSkillRef: boolean;

  public get setPotency(): number {
    return this.potency;
  }

  effectInfo: EffectInfo = { caster: '' };
  casterRef: any;

  public shouldNotShowMessage;

  constructor(opts) {
    extend(this, opts);
    if(!this.name) this.name = this.constructor.name;
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

  protected flagUnapply() {
    if(this.effectInfo.isPermanent) return;
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

  effectMessage(char: Character, message: string|any) {
    if(!char || this.shouldNotShowMessage) return;
    char.sendClientMessage(message);
  }
}

export class SpellEffect extends Effect {
  flagSkills = [];

  potencyMultiplier = 0;

  maxSkillForSkillGain = 0;
  skillMults: Array<number[]>;

  skillFlag(caster) {
    if(caster.baseClass === 'Healer') return SkillClassNames.Restoration;
    if(caster.baseClass === 'Mage')   return SkillClassNames.Conjuration;
    if(caster.baseClass === 'Thief')  return SkillClassNames.Thievery;
    return caster.rightHand ? caster.rightHand.type : 'Martial';
  }

  casterEffectMessage(char: Character, message: string) {
    super.effectMessage(char, { message, subClass: 'spell buff give' });
  }

  targetEffectMessage(char: Character, message: string) {
    super.effectMessage(char, { message, subClass: 'spell buff get' });
  }

  setPotencyAndGainSkill(caster: Character, skillRef?: Skill) {

    this.hasSkillRef = !!skillRef;

    // called from something like a trap
    if(this.casterRef) return;

    // pre-set potency
    if(this.potency) return;

    if(!this.potency && this.skillFlag && skillRef) {
      const flaggedSkill = this.skillFlag(caster);

      this.potency = caster.calcSkillLevel(flaggedSkill) + 1;

      const armorClass = get(caster, 'gear.Armor.itemClass');
      if(includes(MagicCutArmorClasses, armorClass) && includes([SkillClassNames.Conjuration, SkillClassNames.Restoration], flaggedSkill)) {
        caster.sendClientMessage('Your armor exhausts you as you try to cast your spell!');
        this.potency = Math.floor(this.potency / 2);
      }

      const canGainSkill = this.potency <= this.maxSkillForSkillGain;

      if(canGainSkill) {
        caster.gainSkill(flaggedSkill, 1);
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
    if(caster.baseClass === 'Healer') base = this.getCasterStat(caster, 'wis');

    /** PERK:CLASS:MAGE:Mages use int as their primary spellcasting stat. */
    if(caster.baseClass === 'Mage')   base = this.getCasterStat(caster, 'int');

    /** PERK:CLASS:THIEF:Thieves use int as their primary spellcasting stat. */
    if(caster.baseClass === 'Thief')  base = this.getCasterStat(caster, 'int');

    return Math.max(1, base);
  }

  getTotalDamageDieSize(caster: Character): number {
    return Math.floor(this.getMultiplier() * this.getCoreStat(caster));
  }

  getTotalDamageRolls(caster: Character): number {
    let base = this.potency || 1;

    // check based on type, they're both technically wands
    /** PERK:CLASS:MAGE:Mages get a bonus to damage if they hold a wand in their right hand. */
    if(caster.baseClass === 'Mage' && get(caster, 'rightHand.itemClass') === 'Wand') {
      base += get(caster, 'rightHand.tier', 0);
    }

    /** PERK:CLASS:HEALER:Healers get a bonus to damage if they hold a totem in their right hand. */
    if(caster.baseClass === 'Healer' && get(caster, 'rightHand.itemClass') === 'Totem') {
      base += get(caster, 'rightHand.tier', 0);
    }

    return base;
  }

  updateDurationBasedOnTraits(caster: Character): void {
    let durationMultiplierBonus = 0;

    durationMultiplierBonus += caster.getTraitLevelAndUsageModifier('EffectiveSupporter');

    this.duration += Math.floor(this.duration * durationMultiplierBonus);
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

  getCasterStat(caster, stat) {
    if(this.casterRef) return this.casterRef.casterStats[stat];

    return caster.getTotalStat(stat);
  }

  getCasterName(caster: Character, target: Character): string {
    return target.canSeeThroughStealthOf(caster) ? caster.name : 'somebody';
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

export class WeaponEffect extends Effect {

  protected skillRequired: number;

  static isValid(char: Character, weaponClass: string, skillRequired: number): boolean {
    if(char.baseClass !== 'Warrior') return false;
    const item = char.rightHand;
    if(!item || item.type === 'Martial') return false;
    if(item.type !== weaponClass) return false;
    if(item.twoHanded && char.leftHand) return false;
    if(char.calcSkillLevel(item.type) < skillRequired) return false;
    return true;
  }
}

export class StanceEffect extends WeaponEffect {

  public weaponClass: string;

  cast(char: Character, target: Character, skillRef?: Skill): boolean {
    this.weaponClass = char.rightHand.type;

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
