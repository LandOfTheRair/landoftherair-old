
import { SpellEffect } from '../../base/Effect';
import { Character } from '../../../shared/models/character';
import { Skill } from '../../base/Skill';
import * as dice from 'dice.js';

export class Drain extends SpellEffect {

  iconData = {
    name: 'wind-hole',
    color: '#af0000',
    tooltipDesc: 'Constantly losing HP.'
  };

  maxSkillForSkillGain = 25;
  skillMults = [[0, 1], [11, 2], [21, 4]];

  private damagePerRound: number;

  cast(caster: Character, target: Character, skillRef?: Skill) {
    this.setPotencyAndGainSkill(caster, skillRef);

    const damage = +dice.roll(`${this.getTotalDamageRolls(caster)}d${this.getTotalDamageDieSize(caster)}`);

    this.damagePerRound = damage;

    let realDrain = Math.min(damage, target.getTotalStat('hp'));
    if(target.hp.total - realDrain <= 0) realDrain = target.hp.total - 1;

    if(realDrain > 0) target.sendClientMessage('You feel your life force slipping away!');

    caster.sendClientMessage(`You drained ${realDrain} HP from ${target.name}!`);

    target.hp.sub(realDrain);
    caster.hp.add(realDrain);

    if(damage > 0 && caster.getTraitLevel('LingeringDrain')) {
      this.duration = 3;
      target.applyEffect(this);
    }
  }

  effectTick(char: Character) {
    char.hp.sub(this.damagePerRound);
    char.sendClientMessage('Your life force continues to slip away!');
  }
}
