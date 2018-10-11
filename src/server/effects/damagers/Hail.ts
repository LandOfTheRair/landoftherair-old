
import { SpellEffect } from '../../base/Effect';
import { Character } from '../../../shared/models/character';
import { Skill } from '../../base/Skill';
import { RollerHelper } from '../../../shared/helpers/roller-helper';

export class Hail extends SpellEffect {

  maxSkillForSkillGain = 30;
  skillMults = [[0, 2.5], [6, 3], [11, 3.5], [16, 4], [21, 4.5]];

  cast(caster: Character, target: Character, skillRef?: Skill) {
    this.setPotencyAndGainSkill(caster, skillRef);

    for(let i = 0; i < 2; i++) {
      this.magicalAttack(caster, target, {
        skillRef,
        atkMsg: `You fling hail at %0!`,
        defMsg: `%0 pelted you with bullets of hail!`,
        damage: RollerHelper.diceRoll(this.getTotalDamageRolls(caster), this.getTotalDamageDieSize(caster)),
        damageClass: 'ice'
      });
    }
  }
}
