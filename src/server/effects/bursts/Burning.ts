
import { SpellEffect } from '../../base/Effect';
import { Character } from '../../../shared/models/character';
import { CombatHelper } from '../../helpers/combat-helper';
import { Skill } from '../../base/Skill';
import { RecentlyBurned } from '../recents/RecentlyBurned';

export class Burning extends SpellEffect {

  iconData = {
    name: 'fire',
    color: '#DC143C',
    tooltipDesc: 'Constantly receiving fire damage.'
  };

  cast(caster: Character, target: Character, skillRef?: Skill) {
    this.effectInfo = { damage: 0, caster: '' };
    target.applyEffect(this);
  }

  effectStart(char: Character) {
    this.effectMessage(char, 'You\'ve spontaneously combusted!');
  }

  effectTick(char: Character) {
    this.iconData.tooltipDesc = `Receiving ${this.effectInfo.damage.toLocaleString()} fire damage per tick.`;

    const caster = char.$$room.state.findPlayer(this.effectInfo.caster);

    CombatHelper.magicalAttack(caster, char, {
      effect: this,
      defMsg: `You are burning!`,
      damage: this.effectInfo.damage,
      damageClass: 'fire'
    });

  }

  effectEnd(char: Character) {
    const recently = new RecentlyBurned({});
    recently.cast(char, char);
    this.effectMessage(char, 'You are no longer on fire.');
  }
}
