
import { SpellEffect } from '../base/Effect';
import { Character, SkillClassNames } from '../../shared/models/character';
import { Skill } from '../base/Skill';

export class Stunned extends SpellEffect {

  iconData = {
    name: 'knockout',
    color: '#990'
  };

  maxSkillForSkillGain = 9;
  skillFlag = () => SkillClassNames.Restoration;

  cast(caster: Character, target: Character, skillRef?: Skill) {
    this.setPotencyAndGainSkill(caster, skillRef);

    // physical attack
    if(!skillRef) {
      this.duration = 3;

    // cast via spell
    } else {
      // check if skill > wil, if so, stun for skill - will rounds
      // bosses need an exceptionally high will (15+)
    }

    target.applyEffect(this);
  }

  effectStart(char: Character) {
    this.effectMessage(char, 'You are stunned!');
  }

  effectEnd(char: Character) {
    this.effectMessage(char, 'You are no longer stunned.');
  }
}
