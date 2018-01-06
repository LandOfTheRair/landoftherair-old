
import { BuildupEffect } from '../base/Effect';
import { Character } from '../../shared/models/character';
import { Skill } from '../base/Skill';
import { Frosted } from './Frosted';

export class BuildupChill extends BuildupEffect {

  iconData = {
    name: 'cold-heart',
    color: '#004',
    tooltipDesc: 'Frost is building up.'
  };

  cast(caster: Character, target: Character, skillRef?: Skill) {
    this.flagPermanent('');
    target.applyEffect(this);
  }

  buildupProc(char: Character) {
    const frozen = new Frosted({});
    frozen.duration = 10;
    frozen.cast(char, char);
  }
}
