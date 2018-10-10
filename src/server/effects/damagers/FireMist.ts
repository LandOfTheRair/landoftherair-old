
import { random, isUndefined } from 'lodash';

import { SpellEffect } from '../../base/Effect';
import { Character } from '../../../shared/models/character';
import { Skill } from '../../base/Skill';
import * as dice from 'dice.js';
import { MessageHelper } from '../../helpers/world/message-helper';

export class FireMist extends SpellEffect {

  maxSkillForSkillGain = 15;
  skillMults = [[0, 3], [6, 3.5], [11, 4], [16, 4.5], [21, 5]];

  private range: number;

  cast(caster: Character, target: Character|{ x: number, y: number }, skillRef?: Skill) {
    this.setPotencyAndGainSkill(caster, skillRef);

    const range = (isUndefined(this.range) ? 1 : this.range) + (caster.getTraitLevel('FireMistWiden') ? 1 : 0);

    this.effectMessageRadius(caster, { message: 'You hear a soft sizzling noise.', subClass: 'combat magic' }, 10);

    MessageHelper.drawEffectInRadius(caster, 'FIRE_MIST', target, range, 6);

    const attacked = caster.$$room.state.getAllInRange(target, range, [], false);

    const friendlyFireMod = caster.getTraitLevelAndUsageModifier('FriendlyFire');

    attacked.forEach(refTarget => {

      if(friendlyFireMod > 0) {
        const roll = random(0, 100);
        if(roll <= friendlyFireMod && !caster.$$room.state.checkTargetForHostility(caster, refTarget)) return;
      }

      const damage = +dice.roll(`${this.getTotalDamageRolls(caster)}d${this.getTotalDamageDieSize(caster)}`);

      const dist = caster.distFrom(refTarget);

      let damageMod = 1;
      if(dist >= 2) damageMod = 0.75;
      if(dist >= 3) damageMod = 0.5;

      this.magicalAttack(caster, refTarget, {
        skillRef,
        atkMsg: `You engulf %0 in a hot mist!`,
        defMsg: `%0 engulfed you in a hot mist!`,
        damage: Math.floor(damage * damageMod),
        damageClass: 'fire'
      });
    });
  }
}
