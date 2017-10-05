
import { SpellEffect } from '../base/Effect';
import { Character, SkillClassNames } from '../../models/character';
import { CombatHelper } from '../helpers/combat-helper';
import { Skill } from '../base/Skill';
import * as dice from 'dice.js';

export class Cure extends SpellEffect {

  maxSkillForSkillGain = 7;
  skillFlag = () => SkillClassNames.Restoration;

  cast(caster: Character, target: Character, skillRef?: Skill) {
    this.setPotencyAndGainSkill(caster, skillRef);

    let mult = 0.5;
    if(this.potency > 0)  mult = 1;
    if(this.potency > 11) mult = 4;
    if(this.potency > 21) mult = 8;

    const wisCheck = Math.floor(mult * caster.getTotalStat('wis'));
    const damage = -+dice.roll(`${this.potency || 1}d${wisCheck}`);

    CombatHelper.magicalAttack(caster, target, {
      effect: this,
      skillRef,
      atkMsg: `You heal ${target.name}.`,
      defMsg: `${target.name} healed you!`,
      damage,
      damageClass: 'heal'
    });
  }
}
