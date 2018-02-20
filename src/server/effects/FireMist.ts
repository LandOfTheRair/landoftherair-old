
import { SpellEffect } from '../base/Effect';
import { Character, SkillClassNames } from '../../shared/models/character';
import { Skill } from '../base/Skill';
import * as dice from 'dice.js';
import { MessageHelper } from '../helpers/message-helper';

export class FireMist extends SpellEffect {

  maxSkillForSkillGain = 7;
  skillMults = [[0, 2], [11, 2.5], [21, 3]];
  skillFlag = () => SkillClassNames.Conjuration;

  cast(caster: Character, target: Character, skillRef?: Skill) {
    this.setPotencyAndGainSkill(caster, skillRef);

    target.sendClientMessageToRadius({ message: 'You hear a soft sizzling noise.', subClass: 'combat magic' }, 10);

    MessageHelper.drawEffectInRadius(target, 'FIRE_MIST', target, 1, 6);

    const attacked = target.$$room.state.getAllInRange(target, 1);

    attacked.forEach(refTarget => {
      const damage = +dice.roll(`${this.getTotalDamageRolls(caster)}d${this.getTotalDamageDieSize(caster)}`);

      const atkName = refTarget === caster ? 'yourself' : refTarget.name;

      this.magicalAttack(caster, refTarget, {
        skillRef,
        atkMsg: `You engulf ${atkName} in a flaming mist!`,
        defMsg: `${caster.name} engulfed you in a flaming mist!`,
        damage,
        damageClass: 'fire'
      });
    });
  }
}
