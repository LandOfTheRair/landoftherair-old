
import { SpellEffect } from '../../base/Effect';
import { Character } from '../../../shared/models/character';
import { Skill } from '../../base/Skill';

export class Revive extends SpellEffect {

  maxSkillForSkillGain = 7;

  cast(caster: Character, target: Character, skillRef?: Skill) {

    this.setPotencyAndGainSkill(caster, skillRef);

    let hpPercent = 5;
    if(this.potency > 0)  hpPercent = 10;
    if(this.potency > 11) hpPercent = 20;
    if(this.potency > 21) hpPercent = 40;

    if(!target) return;

    target.revive();
    target.hp.setToPercent(hpPercent);
    target.hp.__current = Math.round(target.hp.__current);
    target.gainBaseStat('con', 1);
  }
}
