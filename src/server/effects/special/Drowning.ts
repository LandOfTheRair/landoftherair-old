
import { SpellEffect } from '../../base/Effect';
import { Character } from '../../../shared/models/character';
import { Skill } from '../../base/Skill';
import { CombatHelper } from '../../helpers/world/combat-helper';

export class Drowning extends SpellEffect {

  iconData = {
    name: 'drowning',
    color: '#a00',
    tooltipDesc: 'You are swimming. Find land soon or you\'ll start drowning!'
  };

  private swimElement: string;

  cast(caster: Character, target: Character, skillRef?: Skill) {
    this.potency = this.potency || 4;
    this.flagPermanent(caster.uuid);
    caster.applyEffect(this);
  }

  effectTick(char: Character) {
    const hpPercentLost = this.potency * 4;
    const hpLost = Math.floor(char.hp.maximum * (hpPercentLost / 100));
    CombatHelper.dealOnesidedDamage(char, {
      damage: hpLost,
      damageClass: this.swimElement || 'water',
      damageMessage: 'You are drowning!',
      suppressIfNegative: true,
      overrideSfx: 'combat-hit-melee'
    });
  }
}
