
import { Effect } from '../base/Effect';
import { Character, SkillClassNames } from '../../models/character';

export class BarNecro extends Effect {

  iconData = {
    name: 'rosa-shield',
    bgColor: '#1b390e',
    color: '#fff'
  };

  cast(caster: Character, target: Character) {
    const usedSkill = caster.baseClass === 'Healer' ? SkillClassNames.Restoration : SkillClassNames.Conjuration;
    const durationMult = caster.baseClass === 'Healer' ? 20 : 10;
    if(!this.duration) this.duration = caster.calcSkillLevel(usedSkill) * durationMult;
    if(!this.potency) this.potency = 20 * caster.calcSkillLevel(usedSkill);
    target.applyEffect(this);
  }

  effectStart(char: Character) {
    this.effectMessage(char, 'Your body builds a temporary resistance to the dark arts.');
    char.stats.necroticResist += this.potency;
    char.recalculateStats();
  }

  effectEnd(char: Character) {
    this.effectMessage(char, 'Your dark arts resistance fades.');
    char.stats.necroticResist -= this.potency;
    char.recalculateStats();
  }
}
