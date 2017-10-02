
import { Effect, Maxes } from '../base/Effect';
import { Character, SkillClassNames } from '../../models/character';
import { Skill } from '../base/Skill';

export class Antidote extends Effect {

  cast(caster: Character, target: Character, skillRef?: Skill) {
    if(!this.potency) this.potency = caster.calcSkillLevel(SkillClassNames.Restoration);

    const skillGained = 7 - this.potency;
    if(skillRef && skillGained > 0) {
      caster.gainSkill(SkillClassNames.Restoration, skillGained);
    }

    target.applyEffect(this);
  }

  effectStart(char: Character) {
    const poison = char.hasEffect('Poison');

    if(!poison) return;

    if(this.potency < poison.potency) {
      this.effectMessage(char, 'Your poison was not able to be cured!');
      return;
    }

    if(poison) {
      char.unapplyEffect(poison);
    }

    this.effectMessage(char, 'Your stomach feels better.');
  }
}
