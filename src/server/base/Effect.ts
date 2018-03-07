
import { Character } from '../../shared/models/character';
import { extend, includes, get } from 'lodash';
import { Skill } from './Skill';
import { CombatHelper } from '../helpers/combat-helper';
import { MagicCutArmorClasses } from '../../shared/models/item';

export const Maxes = {
  Lesser: 10,
  Bradley: 13,
  Minor: 15
};

class EffectInfo {
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

  public get setPotency(): number {
    return this.potency;
  }

  effectInfo: EffectInfo = { caster: '', casterName: '' };
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
  }

  protected flagCasterName(casterName: string) {
    this.effectInfo.casterName = casterName;
  }

  protected flagUnapply() {
    this.effectInfo.canManuallyUnapply = true;
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
  skillFlag: Function;
  skillMults: Array<number[]>;

  casterEffectMessage(char: Character, message: string) {
    super.effectMessage(char, { message, subClass: 'spell buff give' });
  }

  targetEffectMessage(char: Character, message: string) {
    super.effectMessage(char, { message, subClass: 'spell buff get' });
  }

  setPotencyAndGainSkill(caster: Character, skillRef?: Skill) {

    // called from something like a trap
    if(this.casterRef) return;

    if(this.skillFlag && skillRef) {
      const flaggedSkill = this.skillFlag(caster);

      this.potency = caster.calcSkillLevel(flaggedSkill) + 1;

      const armorClass = get(caster, 'gear.Armor.itemClass');
      if(includes(MagicCutArmorClasses, armorClass)) {
        caster.sendClientMessage('Your armor exhausts you as you try to cast your spell!');
        this.potency = Math.floor(this.potency / 2);
      }

      const canGainSkill = this.potency <= this.maxSkillForSkillGain;

      if(canGainSkill) {
        caster.gainSkill(flaggedSkill, 1);
      }

    } else if(!this.potency) {
      this.potency = 1;
    }

  }

  getMultiplier(): number {
    let retMult = 0;

    this.skillMults.forEach(([skill, mult]) => {
      if(this.potency > skill) retMult = mult;
    });

    return retMult;
  }

  getCoreStat(caster: Character): number {
    let base = 0;

    if(caster.baseClass === 'Healer') base = this.getCasterStat(caster, 'wis');
    else                              base = this.getCasterStat(caster, 'int');

    return Math.max(1, base);
  }

  getTotalDamageDieSize(caster: Character): number {
    return Math.floor(this.getMultiplier() * this.getCoreStat(caster));
  }

  getTotalDamageRolls(caster: Character): number {
    let base = this.potency || 1;

    // check based on type, they're both technically wands
    if(caster.baseClass === 'Mage' && get(caster, 'rightHand.itemClass') === 'Wand') {
      base += get(caster, 'rightHand.tier', 0);
    }

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

  cast(caster: Character, target: Character, skillRef?: Skill) {}
}

export class ChanneledSpellEffect extends SpellEffect {

  cast(char: Character, target: Character, skillRef?: Skill) {

    // only one stance can be active at a time
    char.effects.forEach(eff => {
      if(!includes(eff.constructor.name, 'Channel')) return;
      char.unapplyEffect(eff, true);
    });

  }
}

export class StanceEffect extends Effect {

  public weaponClass: string;

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

  cast(char: Character, target: Character, skillRef?: Skill): boolean {
    this.weaponClass = char.rightHand.type;

    let foundSelf = false;

    // only one stance can be active at a time
    char.effects.forEach(eff => {
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
  public decayRate = 5;

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
