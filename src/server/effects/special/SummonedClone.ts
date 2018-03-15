
import { Effect } from '../../base/Effect';
import { Character } from '../../../shared/models/character';
import { Skill } from '../../base/Skill';

export class SummonedClone extends Effect {

  iconData = {
    name: 'dark-squad',
    color: '#000',
    tooltipDesc: 'Clone. Summoned by Player.'
  };

  cast(caster: Character, target: Character, skillRef?: Skill) {
    this.iconData.tooltipDesc = `Clone. Summoned by ${caster.name}.`;
    this.flagPermanent(target.uuid);
    target.applyEffect(this);
  }
}
