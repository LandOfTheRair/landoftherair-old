
import { Character } from '../../shared/models/character';
import { extend } from 'lodash';
import { Skill } from './Skill';
import { CombatHelper } from '../helpers/combat-helper';

export const Maxes = {
  Lesser: 10,
  Minor: 15
};

class EffectInfo {
  damage?: number;
  caster: string;
  isPermanent?: boolean;
}

export class Effect {

  name = '';
  iconData = {};
  duration = 0;
  protected potency = 0;

  effectInfo: EffectInfo = { caster: '' };
  casterRef: any;

  constructor(opts) {
    extend(this, opts);
    if(!this.name) this.name = this.constructor.name;
  }

  tick(char: Character) {
    this.effectTick(char);

    this.duration--;
    if(!this.effectInfo.isPermanent && this.duration <= 0) {
      char.unapplyEffect(this);
      this.effectEnd(char);
    }
  }

  effectTick(char: Character) {}
  effectStart(char: Character) {}
  effectEnd(char: Character) {}

  effectMessage(char: Character, message: string|any) {
    if(!char) return;
    char.sendClientMessage(message);
  }
}

export class SpellEffect extends Effect {
  flagSkills = [];

  potencyMultiplier = 0;

  maxSkillForSkillGain = 0;
  skillFlag: Function;

  casterEffectMessage(char: Character, message: string) {
    super.effectMessage(char, { message, subClass: 'spell buff give' });
  }

  targetEffectMessage(char: Character, message: string) {
    super.effectMessage(char, { message, subClass: 'spell buff get' });
  }

  setPotencyAndGainSkill(caster: Character, skillRef?: Skill) {

    // called from something like a trap
    if(this.casterRef) return;

    if(this.skillFlag) {

      const flaggedSkill = this.skillFlag(caster);

      this.potency = caster.calcSkillLevel(flaggedSkill) + 1;

      const skillGained = this.maxSkillForSkillGain - this.potency;

      if(skillRef && skillGained > 0) {
        caster.gainSkill(flaggedSkill, skillGained);
      }

    } else if(!this.potency) {
      this.potency = 1;
    }

  }

  magicalAttack(caster, ref, opts: any = {}) {
    opts.effect = this;

    // trap casters do not have uuid
    if(!caster.uuid) caster = ref;

    CombatHelper.magicalAttack(caster, ref, opts);
  }

  getCasterStat(caster, stat) {
    if(this.casterRef) return this.casterRef.casterStats[stat];

    return caster.getTotalStat(stat);
  }

  cast(caster: Character, target: Character, skillRef: Skill) {}
}
