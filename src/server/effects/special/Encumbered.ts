
import { SpellEffect } from '../../base/Effect';
import { Character } from '../../../shared/models/character';
import { Skill } from '../../base/Skill';

export class Encumbered extends SpellEffect {

  iconData = {
    name: 'armor-vest',
    color: '#f00',
    tooltipDesc: 'You are encumbered, which inhibits spellcasting.'
  };

  cast(caster: Character, target: Character, skillRef?: Skill) {
    this.flagPermanent(caster.uuid);
    caster.applyEffect(this);
  }

  effectStart(char: Character) {
    this.effectMessage(char, 'You are encumbered by your armor!');
  }

  effectEnd(char: Character) {
    this.effectMessage(char, 'You are no longer encumbered.');
  }
}
