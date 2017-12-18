
import { SpellEffect } from '../base/Effect';
import { Character } from '../../shared/models/character';
import { Skill } from '../base/Skill';

export class Dead extends SpellEffect {

  iconData = {
    name: 'broken-skull',
    color: '#000',
    tooltipDesc: 'You are dead. Use the restore macro to come back to life. If you wait too long, your body will rot, risking stat loss!'
  };

  cast(caster: Character, target: Character, skillRef?: Skill) {

    this.duration = -1;
    this.effectInfo = { isPermanent: true, caster: caster.uuid };
    caster.applyEffect(this);
  }

  effectTick(char: Character) {
    if(char.isDead()) return;

    this.effectEnd(char);
    char.unapplyEffect(this);
  }
}
