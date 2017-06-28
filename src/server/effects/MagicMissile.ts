
import { SpellEffect } from '../base/Effect';
import { Character, SkillClassNames } from '../../models/character';
import { CombatHelper } from '../helpers/combat-helper';
import { Skill } from '../base/Skill';
import * as dice from 'dice.js';

export class MagicMissile extends SpellEffect {
  cast(caster: Character, target: Character, skillRef?: Skill) {

    if(!this.potency) this.potency = caster.calcSkillLevel(SkillClassNames.Conjuration);

    let mult = 0.25;
    if(this.potency > 0)  mult = 0.5;
    if(this.potency > 11) mult = 2;
    if(this.potency > 21) mult = 4;

    const skillGained = 7 - this.potency;
    if(skillRef && skillGained > 0) {
      caster.gainSkill(SkillClassNames.Conjuration, skillGained);
    }

    const intCheck = Math.floor(mult * caster.getTotalStat('int'));
    const damage = +dice.roll(`${this.potency || 1}d${intCheck}`);

    CombatHelper.magicalAttack(caster, target, {
      effect: this,
      skillRef,
      atkMsg: `You fling magic missiles at ${target.name}.`,
      defMsg: `${caster.name} hit you with magic missiles!`,
      damage,
      damageClass: 'energy'
    });
  }
}
