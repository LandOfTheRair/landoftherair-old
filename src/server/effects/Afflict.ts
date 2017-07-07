
import { SpellEffect } from '../base/Effect';
import { Character, SkillClassNames } from '../../models/character';
import { CombatHelper } from '../helpers/combat-helper';
import { Skill } from '../base/Skill';
import * as dice from 'dice.js';

export class Afflict extends SpellEffect {
  cast(caster: Character, target: Character, skillRef?: Skill) {

    if(!this.potency) this.potency = caster.calcSkillLevel(SkillClassNames.Restoration);

    let mult = 0.15;
    if(this.potency > 0)  mult = 0.35;
    if(this.potency > 11) mult = 1;
    if(this.potency > 21) mult = 3;

    const skillGained = 7 - this.potency;
    if(skillRef && skillGained > 0) {
      caster.gainSkill(SkillClassNames.Restoration, skillGained);
    }

    const wisCheck = Math.floor(mult * caster.getTotalStat('wis'));
    const damage = +dice.roll(`${this.potency || 1}d${wisCheck}`);

    CombatHelper.magicalAttack(caster, target, {
      effect: this,
      skillRef,
      atkMsg: `You afflict ${target.name}.`,
      defMsg: `${caster.name} hit you with an affliction!`,
      damage,
      damageClass: 'necrotic'
    });
  }
}
