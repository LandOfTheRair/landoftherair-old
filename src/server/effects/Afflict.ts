
import { SpellEffect } from '../base/Effect';
import { Character, SkillClassNames } from '../../shared/models/character';
import { Skill } from '../base/Skill';
import * as dice from 'dice.js';

export class Afflict extends SpellEffect {

  maxSkillForSkillGain = 30;
  skillFlag = () => SkillClassNames.Restoration;
  skillMults = [[0, 2.75], [11, 3.75], [21, 4]];

  cast(caster: Character, target: Character, skillRef?: Skill) {
    this.setPotencyAndGainSkill(caster, skillRef);

    const damage = +dice.roll(`${this.getTotalDamageRolls(caster)}d${this.getTotalDamageDieSize(caster)}`);

    this.magicalAttack(caster, target, {
      skillRef,
      atkMsg: `You afflict ${target.name}!`,
      defMsg: `${caster.name} hit you with an affliction!`,
      damage,
      damageClass: 'necrotic'
    });
  }
}
