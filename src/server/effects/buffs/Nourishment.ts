
import { SpellEffect } from '../../base/Effect';
import { Character, StatName } from '../../../shared/models/character';
import { Skill } from '../../base/Skill';
import { Player } from '../../../shared/models/player';

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
    this.shouldNotShowMessage = false;
    this.effectMessage(char, this.message || 'Yum!');

    const isMalnourished = char.hasEffect('Malnourished');
    if(isMalnourished) {
      char.unapplyEffect(isMalnourished, true);
    }

    this.duration += Math.round(this.duration * char.getTraitLevelAndUsageModifier('SlowDigestion'));

    char.$$hungerTicks = this.duration + (3600 * 6);

    const sweetToothLevel = char.getTraitLevel('SweetTooth');
    if(sweetToothLevel) {
      this.stats = this.stats || {};
      this.stats.hpregen = (this.stats.hpregen || 0) + sweetToothLevel * 3;
      this.stats.mpregen = (this.stats.mpregen || 0) + sweetToothLevel * 3;
      this.stats.armorClass = (this.stats.armorClass || 0) - sweetToothLevel * 2;

      if(this.tooltip) this.tooltip = `${this.tooltip}; Sweet Tooth: +${sweetToothLevel * 3} MP/HP Regen, -${sweetToothLevel * 2} AC`;
    }

    if(this.tooltip) this.iconData.tooltipDesc = `Nourished: ${this.tooltip}`;

    Object.keys(this.stats || {}).forEach(stat => {
      this.gainStat(char, <StatName>stat, this.stats[stat]);
    });
  }

  effectEnd(char: Player) {
    this.effectMessage(char, 'Your nourishment has worn off.');
  }
}
