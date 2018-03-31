
import { SpellEffect } from '../../base/Effect';
import { Character } from '../../../shared/models/character';
import { Skill } from '../../base/Skill';
import * as dice from 'dice.js';

export class Drain extends SpellEffect {

  maxSkillForSkillGain = 25;
  skillMults = [[0, 1], [11, 2], [21, 4]];

  cast(caster: Character, target: Character, skillRef?: Skill) {
    this.setPotencyAndGainSkill(caster, skillRef);

    const damage = +dice.roll(`${this.getTotalDamageRolls(caster)}d${this.getTotalDamageDieSize(caster)}`);

    let realDrain = Math.min(damage, target.getTotalStat('hp'));
    if(target.hp.total - realDrain <= 0) realDrain = target.hp.total - 1;

    if(realDrain > 0) target.sendClientMessage('You feel your life force slipping away!');

    caster.sendClientMessage(`You drained ${realDrain} HP from ${target.name}!`);

    target.hp.sub(realDrain);
    caster.hp.add(realDrain);
  }
}
