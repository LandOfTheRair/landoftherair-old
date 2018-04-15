
import { SpellEffect } from '../../base/Effect';
import { Character } from '../../../shared/models/character';
import { Skill } from '../../base/Skill';

export class WallSight extends SpellEffect {

  iconData = {
    name: 'all-seeing-eye',
    color: '#0a0',
    tooltipDesc: 'Seeing through walls.'
  };

  maxSkillForSkillGain = 7;

  cast(caster: Character, target: Character, skillRef?: Skill) {
    this.flagCasterName(caster.name);
    this.flagPermanent(caster.uuid);
    this.flagUnapply(true);
    target.applyEffect(this);
  }

  effectStart(char: Character) {
    this.targetEffectMessage(char, 'You can see through walls!');
  }

  effectEnd(char: Character) {
    this.effectMessage(char, 'Your vision returns to normal.');
  }
}
