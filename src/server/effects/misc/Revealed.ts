
import { SpellEffect } from '../../base/Effect';
import { Character } from '../../../shared/models/character';
import { Skill } from '../../base/Skill';

export class Revealed extends SpellEffect {

  iconData = {
    name: 'eye-target',
    color: '#ccc',
    bgColor: '#000',
    tooltipDesc: 'Revealed and cannot hide.'
  };

  cast(caster: Character, target: Character, skillRef?: Skill) {
    this.duration = this.duration || 5;

    const hidden = target.hasEffect('Hidden');
    const shadowMeld = target.hasEffect('ShadowMeld');

    if(hidden)                                  target.unapplyEffect(hidden, true);
    if(shadowMeld && shadowMeld.duration > 3)   target.unapplyEffect(shadowMeld, true);

    if(hidden || shadowMeld) target.sendClientMessage('You were forced out of hiding!');

    target.applyEffect(this);
  }

}
