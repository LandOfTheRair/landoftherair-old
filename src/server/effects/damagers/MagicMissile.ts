
import { SpellEffect } from '../../base/Effect';
import { Character } from '../../../shared/models/character';
import { Skill } from '../../base/Skill';
import { RollerHelper } from '../../../shared/helpers/roller-helper';

export class MagicMissile extends SpellEffect {

  maxSkillForSkillGain = 30;
  skillMults = [[0, 1], [6, 1.75], [11, 2.5], [16, 3.25], [21, 4]];

  cast(caster: Character, target: Character, skillRef?: Skill) {
    this.setPotencyAndGainSkill(caster, skillRef);

    const damage = RollerHelper.diceRoll(this.getTotalDamageRolls(caster), this.getTotalDamageDieSize(caster));

    this.magicalAttack(caster, target, {
      skillRef,
      atkMsg: `You fling magic missiles at %0!`,
      defMsg: `%0 hit you with magic missiles!`,
      damage,
      damageClass: 'energy'
    });
  }
}
