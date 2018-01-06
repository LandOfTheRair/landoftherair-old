
import { SpellEffect } from '../base/Effect';
import { Character, SkillClassNames } from '../../shared/models/character';
import { Skill } from '../base/Skill';
import * as dice from 'dice.js';

export class Afflict extends SpellEffect {

  maxSkillForSkillGain = 30;
  skillFlag = () => SkillClassNames.Restoration;

  cast(caster: Character, target: Character, skillRef?: Skill) {
    this.setPotencyAndGainSkill(caster, skillRef);

    let mult = 1;
    if(this.potency > 0)  mult = 2.5;
    if(this.potency > 11) mult = 3.5;
    if(this.potency > 21) mult = 4;

    const wisCheck = Math.floor(mult * this.getCasterStat(caster, 'wis'));
    const damage = +dice.roll(`${this.potency || 1}d${wisCheck}`);

    this.magicalAttack(caster, target, {
      skillRef,
      atkMsg: `You afflict ${target.name}!`,
      defMsg: `${caster.name} hit you with an affliction!`,
      damage,
      damageClass: 'necrotic'
    });
  }
}
