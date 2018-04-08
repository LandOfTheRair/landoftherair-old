
import { SpellEffect } from '../../base/Effect';
import { Character, StatName } from '../../../shared/models/character';
import { Skill } from '../../base/Skill';
import { Player } from '../../../shared/models/player';

export class GemDust extends SpellEffect {

  stats: any;
  gemDesc: string;

  iconData = {
    name: 'gem-chain',
    color: '#f0f',
    tooltipDesc: 'Dusted.'
  };

  cast(caster: Character, target: Character, skillRef?: Skill) {
    this.iconData.tooltipDesc = `Enveloped in the dust of ${this.gemDesc}.`;
    this.flagUnapply();
    this.duration = 3600;
    caster.applyEffect(this);
  }

  effectStart(char: Player) {
    this.effectMessage(char, `You've been enveloped by the dust of ${this.gemDesc}.`);

    Object.keys(this.stats || {}).forEach(stat => {
      char.gainStat(<StatName>stat, this.stats[stat]);
    });
  }

  effectEnd(char: Player) {
    this.effectMessage(char, 'Your gem dust has worn off.');

    Object.keys(this.stats || {}).forEach(stat => {
      char.gainStat(<StatName>stat, -this.stats[stat]);
    });
  }
}
