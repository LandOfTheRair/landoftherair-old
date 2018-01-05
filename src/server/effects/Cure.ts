
import { SpellEffect } from '../base/Effect';
import { Character, SkillClassNames } from '../../shared/models/character';
import { Skill } from '../base/Skill';
import * as dice from 'dice.js';

export class Cure extends SpellEffect {

  maxSkillForSkillGain = 7;
  skillFlag = () => SkillClassNames.Restoration;

  cast(caster: Character, target: Character, skillRef?: Skill) {
    this.setPotencyAndGainSkill(caster, skillRef);

    let mult = 2;
    if(this.potency > 0)  mult = 4;
    if(this.potency > 11) mult = 6;
    if(this.potency > 21) mult = 10;

    const wisCheck = Math.floor(mult * this.getCasterStat(caster, 'wis'));
    const damage = -+dice.roll(`${this.potency || 1}d${wisCheck}`);

    caster.$$room.state.getAllHostilesInRange(caster, 4).forEach(mon => {
      mon.addAgro(caster, Math.abs(damage / 10));
    });

    this.magicalAttack(caster, target, {
      skillRef,
      atkMsg: `You heal ${target.name}.`,
      defMsg: `${caster.name} healed you!`,
      damage,
      damageClass: 'heal'
    });
  }
}
