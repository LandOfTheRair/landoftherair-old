
import { SpellEffect } from '../base/Effect';
import { Character, SkillClassNames } from '../../models/character';
import { Skill } from '../base/Skill';

export class Revive extends SpellEffect {
  cast(caster: Character, target: Character, skillRef?: Skill) {

    if(!this.potency) this.potency = caster.calcSkillLevel(SkillClassNames.Restoration);

    let hpPercent = 5;
    if(this.potency > 0)  hpPercent = 10;
    if(this.potency > 11) hpPercent = 20;
    if(this.potency > 21) hpPercent = 40;

    const skillGained = 7 - this.potency;
    if(skillRef && skillGained > 0) {
      caster.gainSkill(SkillClassNames.Restoration, skillGained);
    }

    if(!target) return;

    target.hp.setToPercent(hpPercent);
    target.dir = 'S';
  }
}
