
import { SpellEffect } from '../../base/Effect';
import { Character } from '../../../shared/models/character';
import { Skill } from '../../base/Skill';

export class ScaleShredder extends SpellEffect {

  iconData = {
    name: 'spiked-dragon-head',
    color: '#f00',
    tooltipDesc: 'Negate the resistances of dragon-class monsters.'
  };

  cast(caster: Character, target: Character, skillRef?: Skill) {
    this.flagCasterName(caster.name);

    if(!this.duration) this.duration = 900 * this.potency;

    target.applyEffect(this);
  }

  effectStart(char: Character) {
    this.targetEffectMessage(char, 'You begin to glow like orange ether.');
  }
  effectEnd(char: Character) {
    this.targetEffectMessage(char, 'Your orange ether glow fades.');
  }
}
