
import { Effect } from '../../base/Effect';
import { Skill } from '../../base/Skill';
import { Character } from '../../../shared/models/character';

export class Newbie extends Effect {

  iconData = {
    name: 'person',
    bgColor: '#000',
    color: '#0a0',
    tooltipDesc: 'This player is new! Gain +10% XP to all kills.'
  };

  cast(caster: Character, target: Character, skillRef?: Skill) {
    this.flagPermanent(target.uuid);
    caster.applyEffect(this);
  }

}
