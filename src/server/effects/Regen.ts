
import { SpellEffect } from '../base/Effect';
import { Character, SkillClassNames } from '../../shared/models/character';
import { CombatHelper } from '../helpers/combat-helper';
import { Skill } from '../base/Skill';
import * as dice from 'dice.js';

export class Regen extends SpellEffect {

  iconData = {
    name: 'star-swirl',
    color: '#00a',
    tooltipDesc: 'Constantly restoring health.'
  };

  maxSkillForSkillGain = 15;
  skillFlag = (caster) => SkillClassNames.Restoration;

  cast(caster: Character, target: Character, skillRef?: Skill) {

    this.setPotencyAndGainSkill(caster, skillRef);

    if(caster !== target) {
      this.effectMessage(caster, `You are regenerating ${target.name}!`);
    }

    let mult = 0.25;
    if(this.potency > 0)  mult = 0.5;
    if(this.potency > 11) mult = 1;
    if(this.potency > 21) mult = 2;

    const wisCheck = Math.floor(mult * this.getCasterStat(caster, 'wis'));
    const damage = -+dice.roll(`${this.potency || 1}d${wisCheck}`);

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
