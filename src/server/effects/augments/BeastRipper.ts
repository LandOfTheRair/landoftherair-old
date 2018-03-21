
import { SpellEffect } from '../../base/Effect';
import { Character } from '../../../shared/models/character';
import { Skill } from '../../base/Skill';

export class BeastRipper extends SpellEffect {

  iconData = {
    name: 'bird-claw',
    color: '#f00',
    tooltipDesc: 'Negate the resistances of beast-class monsters.'
  };

  cast(caster: Character, target: Character, skillRef?: Skill) {
    this.flagUnapply();
    this.flagCasterName(caster.name);

    if(!this.duration) this.duration = 900 * this.potency;

    target.applyEffect(this);
  }

  effectStart(char: Character) {
    this.targetEffectMessage(char, 'You begin to glow like green ether.');
  }
  effectEnd(char: Character) {
    this.targetEffectMessage(char, 'Your green ether glow fades.');
  }
}
