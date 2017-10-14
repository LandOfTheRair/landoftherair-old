
import { SpellEffect } from '../base/Effect';
import { Character, SkillClassNames } from '../../shared/models/character';
import { Skill } from '../base/Skill';
import * as dice from 'dice.js';

export class MagicMissile extends SpellEffect {

  maxSkillForSkillGain = 7;
  skillFlag = () => SkillClassNames.Conjuration;

  cast(caster: Character, target: Character, skillRef?: Skill) {
    this.setPotencyAndGainSkill(caster, skillRef);

    let mult = 0.25;
    if(this.potency > 0)  mult = 0.5;
    if(this.potency > 11) mult = 2;
    if(this.potency > 21) mult = 4;

    const intCheck = Math.floor(mult * this.getCasterStat(caster, 'int'));
    const damage = +dice.roll(`${this.potency || 1}d${intCheck}`);

    this.magicalAttack(caster, target, {
      skillRef,
      atkMsg: `You fling magic missiles at ${target.name}!`,
      defMsg: `${caster.name} hit you with magic missiles!`,
      damage,
      damageClass: 'energy'
    });
  }
}
