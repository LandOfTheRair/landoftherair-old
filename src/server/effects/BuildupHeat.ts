
import { BuildupEffect } from '../base/Effect';
import { Character } from '../../shared/models/character';
import { Skill } from '../base/Skill';
import { Burning } from './Burning';

export class BuildupHeat extends BuildupEffect {

  iconData = {
    name: 'fire',
    color: '#400',
    tooltipDesc: 'Heat is building up.'
  };

  cast(caster: Character, target: Character, skillRef?: Skill) {
    this.duration = -1;
    this.effectInfo = { isPermanent: true, caster: '' };
    target.applyEffect(this);
  }

  buildupProc(char: Character) {
    const burning = new Burning({});
    burning.duration = 10;
    burning.cast(char, char);

    burning.effectInfo.damage = Math.floor(this.buildupDamage / 20);
  }
}
