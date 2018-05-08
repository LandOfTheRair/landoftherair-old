
import { SpellEffect } from '../../base/Effect';
import { Character } from '../../../shared/models/character';
import { Skill } from '../../base/Skill';
import * as dice from 'dice.js';

export class Asper extends SpellEffect {

  iconData = {
    name: 'wind-hole',
    color: '#0059bd',
    tooltipDesc: 'Constantly losing MP.'
  };

  maxSkillForSkillGain = 25;
  skillMults = [[0, 1], [11, 2], [21, 4]];

  private damagePerRound: number;

  cast(caster: Character, target: Character, skillRef?: Skill) {
    this.setPotencyAndGainSkill(caster, skillRef);

    const damage = +dice.roll(`${this.getTotalDamageRolls(caster)}d${this.getTotalDamageDieSize(caster)}`);

    this.damagePerRound = damage;

    const realDrain = Math.min(damage, target.mp.maximum);

    if(realDrain > 0) target.sendClientMessage('You feel your mental energy slipping away!');
    caster.sendClientMessage(`You drained ${realDrain} MP from ${target.name}!`);

    target.mp.sub(realDrain);
    caster.mp.add(realDrain);

    if(damage > 0 && caster.getTraitLevel('LingeringAsper')) {
      this.duration = 3;
      target.applyEffect(this);
    }
  }

  effectTick(char: Character) {
    char.mp.sub(this.damagePerRound);
    char.sendClientMessage('Your mental energy continues to slip away!');
  }
}
