
import { SpellEffect } from '../base/Effect';
import { Character, SkillClassNames, StatName } from '../../shared/models/character';
import { Skill } from '../base/Skill';
import { CharacterHelper } from '../helpers/character-helper';
import { Player } from '../../shared/models/player';

export class Nourishment extends SpellEffect {

  stats: any;
  tooltip: string;
  message: string;

  iconData = {
    name: 'meal',
    color: '#000',
    tooltipDesc: 'Nourished.'
  };

  cast(caster: Character, target: Character, skillRef?: Skill) {
    caster.applyEffect(this);
  }

  effectStart(char: Player) {
    this.effectMessage(char, this.message || 'Yum!');

    const isMalnourished = char.hasEffect('Malnourished');
    if(isMalnourished) {
      char.unapplyEffect(isMalnourished);
    }

    char.$$hungerTicks = this.duration + (3600 * 6);

    if(this.tooltip) this.iconData.tooltipDesc = `Nourished: ${this.tooltip}`;

    Object.keys(this.stats || {}).forEach(stat => {
      char.gainStat(<StatName>stat, this.stats[stat]);
    });
  }

  effectEnd(char: Player) {
    this.effectMessage(char, 'Your nourishment has worn off.');

    Object.keys(this.stats || {}).forEach(stat => {
      char.gainStat(<StatName>stat, -this.stats[stat]);
    });
  }
}
