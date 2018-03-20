
import { SpellEffect } from '../../base/Effect';
import { Character } from '../../../shared/models/character';
import { Skill } from '../../base/Skill';
import * as dice from 'dice.js';

export class Asper extends SpellEffect {

  maxSkillForSkillGain = 25;
  skillMults = [[0, 2.75], [11, 3.75], [21, 4]];

  cast(caster: Character, target: Character, skillRef?: Skill) {
    this.setPotencyAndGainSkill(caster, skillRef);

    const damage = +dice.roll(`${this.getTotalDamageRolls(caster)}d${this.getTotalDamageDieSize(caster)}`);

    const realDrain = Math.min(damage, target.mp.maximum);

    if(realDrain > 0) target.sendClientMessage('You feel your mental energy slipping away!');
    caster.sendClientMessage(`You drained ${realDrain} MP from ${target.name}!`);

    target.mp.sub(realDrain);
    caster.mp.add(realDrain);
  }
}
