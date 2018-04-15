
import { isUndefined } from 'lodash';

import { SpellEffect } from '../../base/Effect';
import { Character } from '../../../shared/models/character';
import { Skill } from '../../base/Skill';

export class Darkness extends SpellEffect {

  maxSkillForSkillGain = 11;

  private range: number;

  cast(caster: Character, target: Character, skillRef?: Skill) {
    this.setPotencyAndGainSkill(caster, skillRef);

    /** PERK:CLASS:THIEF:Thieves darkness lasts twice as long. */
    const mult = caster.baseClass === 'Thief' ? 2 : 1;

    // skill - 7 in quarter-minutes
    const duration = Math.max(1, this.potency - 7) * mult;

    caster.sendClientMessage('You cloak the area in a veil of darkness.');

    const radius = (caster.baseClass === 'Thief' ? 0 : 1)
      + (isUndefined(this.range) ? 0 : this.range)
      + (caster.getTraitLevel('DarknessWiden') ? 1 : 0);

    /** PERK:CLASS:THIEF:Thieves darkness only covers one tile. */
    target.$$room.createDarkness(target.x, target.y, radius, duration);

    this.aoeAgro(caster, 10);
  }
}
