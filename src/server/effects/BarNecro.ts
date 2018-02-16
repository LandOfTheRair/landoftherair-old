
import { SpellEffect } from '../base/Effect';
import { Character, SkillClassNames } from '../../shared/models/character';
import { Skill } from '../base/Skill';

export class BarNecro extends SpellEffect {

  iconData = {
    name: 'rosa-shield',
    bgColor: '#1b390e',
    color: '#fff',
    tooltipDesc: 'Negate some necrotic damage.'
  };

  maxSkillForSkillGain = 7;
  potencyMultiplier = 20;
  skillFlag = () => SkillClassNames.Restoration;

  cast(caster: Character, target: Character, skillRef?: Skill) {
    this.setPotencyAndGainSkill(caster, skillRef);

    if(!this.duration) this.duration = 100 * caster.calcSkillLevel(SkillClassNames.Restoration);

    if(caster !== target) {
      this.casterEffectMessage(caster, `You cast BarNecro on ${target.name}.`);
    }

    target.applyEffect(this);
  }

  effectStart(char: Character) {
    this.targetEffectMessage(char, 'Your body builds a temporary resistance to the dark arts.');
    char.gainStat('necroticResist', this.potency * this.potencyMultiplier);
  }

  effectEnd(char: Character) {
    this.effectMessage(char, 'Your dark arts resistance fades.');
    char.loseStat('necroticResist', this.potency * this.potencyMultiplier);
  }
}
