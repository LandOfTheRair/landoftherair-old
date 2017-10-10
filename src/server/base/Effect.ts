
import { Character } from '../../models/character';
import { extend } from 'lodash';
import { Skill } from './Skill';

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
    if(this.skillFlag) {

      const flaggedSkill = this.skillFlag(caster);

      this.potency = caster.calcSkillLevel(flaggedSkill) + 1;

      const skillGained = this.maxSkillForSkillGain - this.potency;

      if(skillRef && skillGained > 0) {
        caster.gainSkill(flaggedSkill, skillGained);
      }

    } else {
      this.potency = 1;
    }

  }

  cast(caster: Character, target: Character, skillRef: Skill) {}
}
