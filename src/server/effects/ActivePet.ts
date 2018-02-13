
import { Effect } from '../base/Effect';
import { Character } from '../../shared/models/character';
import { Skill } from '../base/Skill';

export class ActivePet extends Effect {

  iconData = {
    name: 'eagle-emblem',
    bgColor: '#a0a',
    color: '#fff',
    tooltipDesc: 'Sharing your physical essence with your summoned pet.'
  };

  cast(caster: Character, target: Character, skillRef?: Skill) {
    caster.applyEffect(this);
  }

  effectStart(char: Character) {
    char.loseStat('weaponArmorClass', Math.floor(this.potency / 2));
    char.loseStat('armorClass', Math.floor(this.potency / 2));
    char.loseStat('defense', Math.floor(this.potency / 2));
    char.loseStat('offense', Math.floor(this.potency / 2));
    char.loseStat('accuracy', Math.floor(this.potency / 2));
  }

  effectTick(char: Character) {
    if(char.$$pet && !char.$$pet.isDead()) return;

    this.effectEnd(char);
    char.unapplyEffect(this);
  }

  effectEnd(char: Character) {
    if(char.$$pet) {
      char.$$pet.die(char, true);
    }

    char.gainStat('weaponArmorClass', Math.floor(this.potency / 2));
    char.gainStat('armorClass', Math.floor(this.potency / 2));
    char.gainStat('defense', Math.floor(this.potency / 2));
    char.gainStat('offense', Math.floor(this.potency / 2));
    char.gainStat('accuracy', Math.floor(this.potency / 2));
  }
}
