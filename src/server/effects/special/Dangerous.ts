
import { Effect } from '../../base/Effect';
import { Character } from '../../../shared/models/character';
import { Skill } from '../../base/Skill';

export class Dangerous extends Effect {

  iconData = {
    name: 'crowned-skull',
    bgColor: '#000',
    color: '#fff',
    tooltipDesc: 'This creature is dangerous! It has above average stats and may strip your gear on death.'
  };

  cast(caster: Character, target: Character, skillRef?: Skill) {
    this.flagPermanent(target.uuid);
    caster.applyEffect(this);
  }

  effectStart(char: Character) {
    this.gainStat(char, 'hpregen', 100);
  }

  effectTick(char: Character) {
    if(char.combatTicks) return;
    char.hp.add(Math.floor(char.hp.maximum / 100));
  }

}
