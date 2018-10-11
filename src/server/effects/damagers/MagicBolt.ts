
import { SpellEffect } from '../../base/Effect';
import { Character } from '../../../shared/models/character';
import { Skill } from '../../base/Skill';
import { Stun } from '../index';
import { RollerHelper } from '../../../shared/helpers/roller-helper';

export class MagicBolt extends SpellEffect {

  maxSkillForSkillGain = 30;
  skillMults = [[0, 4], [6, 5], [11, 6], [16, 7], [21, 8]];

  cast(caster: Character, target: Character, skillRef?: Skill) {
    this.setPotencyAndGainSkill(caster, skillRef);

    const damage = RollerHelper.diceRoll(this.getTotalDamageRolls(caster), this.getTotalDamageDieSize(caster));

    this.magicalAttack(caster, target, {
      skillRef,
      atkMsg: `You fire a magic bolt at %0!`,
      defMsg: `%0 hit you with a magic bolt!`,
      damage,
      damageClass: 'energy'
    });

    const concussiveChance = caster.getTraitLevelAndUsageModifier('ConcussiveBolt');
    if(RollerHelper.XInOneHundred(concussiveChance)) {
      const stunned = new Stun({ potency: this.potency, duration: 5 });
      stunned.shouldNotShowMessage = true;
      stunned.cast(caster, target);
      stunned.shouldNotShowMessage = false;
    }
  }
}
