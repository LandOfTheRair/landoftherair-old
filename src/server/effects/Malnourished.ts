
import { SpellEffect } from '../base/Effect';
import { Character, StatName } from '../../shared/models/character';
import { Skill } from '../base/Skill';
import { Player } from '../../shared/models/player';

export class Malnourished extends SpellEffect {

  stats = {
    hpregen: -1,
    mpregen: -1,
    str: -1,
    dex: -1,
    agi: -1,
    int: -1,
    wis: -1,
    wil: -1
  };

  iconData = {
    name: 'meal',
    color: '#f00',
    tooltipDesc: 'Malnourished. Seek food or drink.'
  };

  cast(caster: Character, target: Character, skillRef?: Skill) {

    this.duration = -1;
    this.effectInfo = { isPermanent: true, caster: caster.uuid };
    caster.applyEffect(this);
  }

  effectStart(char: Player) {
    this.effectMessage(char, 'You feel like your body is wasting away.');

    Object.keys(this.stats || {}).forEach(stat => {
      char.gainStat(<StatName>stat, this.stats[stat]);
    });
  }

  effectEnd(char: Player) {
    this.effectMessage(char, 'Your body feels better.');

    Object.keys(this.stats || {}).forEach(stat => {
      char.loseStat(<StatName>stat, this.stats[stat]);
    });
  }
}
