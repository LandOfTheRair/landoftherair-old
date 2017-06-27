
import { Effect, Maxes } from '../base/Effect';
import { Character, SkillClassNames } from '../../models/character';

export class TrueSight extends Effect {

  iconData = {
    name: 'all-seeing-eye',
    color: '#00a'
  };

  cast(caster: Character, target: Character) {
    const usedSkill = caster.baseClass === 'Healer' ? SkillClassNames.Restoration : SkillClassNames.Conjuration;
    const durationMult = caster.baseClass === 'Healer' ? 20 : 10;
    if(!this.duration) this.duration = caster.calcSkillLevel(usedSkill) * durationMult;
    target.applyEffect(this);
  }

  effectStart(char: Character) {
    this.effectMessage(char, 'Your vision expands to see other planes of existence.');
  }

  effectEnd(char: Character) {
    this.effectMessage(char, 'Your vision returns to normal.');
  }
}
