
import { Effect } from '../../base/Effect';
import { Character } from '../../../shared/models/character';
import { Skill } from '../../base/Skill';

export class Unshakeable extends Effect {

  iconData = {
    name: 'black-hand-shield',
    bgColor: '#000',
    color: '#fff',
    tooltipDesc: 'This creature is immovable and cannot be hit by effects such as Prone and Push.'
  };

  cast(caster: Character, target: Character, skillRef?: Skill) {
    this.flagPermanent(target.uuid);
    caster.applyEffect(this);
  }

}
