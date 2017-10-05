
import { SpellEffect } from '../base/Effect';
import { Character, SkillClassNames } from '../../models/character';
import { CombatHelper } from '../helpers/combat-helper';
import { Skill } from '../base/Skill';
import * as dice from 'dice.js';

export class FireMist extends SpellEffect {

  maxSkillForSkillGain = 7;
  skillFlag = () => SkillClassNames.Conjuration;

  cast(caster: Character, target: Character, skillRef?: Skill) {
    this.setPotencyAndGainSkill(caster, skillRef);

    let mult = 0.5;
    if(this.potency > 0)  mult = 1;
    if(this.potency > 11) mult = 1.5;
    if(this.potency > 21) mult = 2;

    const intCheck = Math.floor(mult * caster.getTotalStat('int'));

    target.sendClientMessageToRadius({ message: 'You hear a soft sizzling noise.', subClass: 'combat magic' }, 10);

    target.drawEffectInRadius('FIRE_MIST', target, 1, 6);

    const attacked = target.$$room.state.getAllInRange(target, 1);

    attacked.forEach(refTarget => {
      const damage = +dice.roll(`${this.potency || 1}d${intCheck}`);

      const atkName = refTarget === caster ? 'yourself' : refTarget.name;

      CombatHelper.magicalAttack(caster, refTarget, {
        effect: this,
        skillRef,
        atkMsg: `You engulf ${atkName} in a flaming mist!`,
        defMsg: `${refTarget.name} engulfed you in a flaming mist!`,
        damage,
        damageClass: 'fire'
      });
    });
  }
}
