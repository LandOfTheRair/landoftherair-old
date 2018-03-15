
import { Effect } from '../../base/Effect';
import { Character } from '../../../shared/models/character';
import { Skill } from '../../base/Skill';

import { some } from 'lodash';

export class ActiveClones extends Effect {

  iconData = {
    name: 'dark-squad',
    bgColor: '#000',
    color: '#fff',
    tooltipDesc: 'You have summoned backup.'
  };

  cast(caster: Character, target: Character, skillRef?: Skill) {
    caster.applyEffect(this);
  }

  effectTick(char: Character) {
    if(char.$$pets && some(char.$$pets, pet => !pet.isDead())) return;

    this.effectEnd(char);
    char.unapplyEffect(this);
  }

  effectEnd(char: Character) {
    char.killAllPets();
  }
}
