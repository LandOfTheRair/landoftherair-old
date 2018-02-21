
import { SpellEffect } from '../../base/Effect';
import { Character, SkillClassNames } from '../../../shared/models/character';
import { CombatHelper } from '../../helpers/combat-helper';
import { Skill } from '../../base/Skill';
import * as dice from 'dice.js';

export class Regen extends SpellEffect {

  iconData = {
    name: 'star-swirl',
    color: '#00a',
    tooltipDesc: 'Constantly restoring health.'
  };

  maxSkillForSkillGain = 15;
  skillMults = [[0, 0.5], [11, 1], [21, 2]];
  skillFlag = (caster) => SkillClassNames.Restoration;

  cast(caster: Character, target: Character, skillRef?: Skill) {

    this.setPotencyAndGainSkill(caster, skillRef);

    if(caster !== target) {
      this.effectMessage(caster, `You are regenerating ${target.name}!`);
    }

    const damage = -+dice.roll(`${this.getTotalDamageRolls(caster)}d${this.getTotalDamageDieSize(caster)}`);

    this.duration = this.duration || 10;

    this.effectInfo = { damage, caster: caster.uuid };
    target.applyEffect(this);
  }

  effectStart(char: Character) {
    this.effectMessage(char, 'Your body begins to repair itself more quickly!');
  }

  effectTick(char: Character) {
    const caster = char.$$room.state.findPlayer(this.effectInfo.caster);

    CombatHelper.magicalAttack(caster, char, {
      effect: this,
      defMsg: `You are regenerating health!`,
      damage: this.effectInfo.damage,
      damageClass: 'heal'
    });

  }

  effectEnd(char: Character) {
    this.effectMessage(char, 'Your body is no longer regenerating quickly.');
  }
}
