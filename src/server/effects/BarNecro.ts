
import { Effect, SpellEffect } from '../base/Effect';
import { Character, SkillClassNames } from '../../models/character';
import { Skill } from '../base/Skill';

export class BarNecro extends SpellEffect {

  iconData = {
    name: 'rosa-shield',
    bgColor: '#1b390e',
    color: '#fff'
  };

  maxSkillForSkillGain = 7;
  potencyMultiplier = 20;
  skillFlag = () => SkillClassNames.Restoration;

  cast(caster: Character, target: Character, skillRef?: Skill) {
    this.setPotencyAndGainSkill(caster, skillRef);

    if(!this.duration) this.duration = 10 * caster.calcSkillLevel(SkillClassNames.Restoration);

    target.applyEffect(this);
  }

  effectStart(char: Character) {
    this.effectMessage(char, 'Your body builds a temporary resistance to the dark arts.');
    char.gainStat('necroticResist', this.potency * this.potencyMultiplier);
    char.recalculateStats();
  }

  effectEnd(char: Character) {
    this.effectMessage(char, 'Your dark arts resistance fades.');
    char.loseStat('necroticResist', this.potency * this.potencyMultiplier);
    char.recalculateStats();
  }
}
