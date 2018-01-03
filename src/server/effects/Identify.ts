
import { SpellEffect } from '../base/Effect';
import { Character, SkillClassNames } from '../../shared/models/character';
import { Skill } from '../base/Skill';

export class Identify extends SpellEffect {

  maxSkillForSkillGain = 7;
  skillFlag = (caster) => {
    if(caster.baseClass === 'Mage')   return SkillClassNames.Conjuration;
    return SkillClassNames.Thievery;
  }

  cast(caster: Character, target: Character, skillRef?: Skill) {
    this.setPotencyAndGainSkill(caster, skillRef);
    caster.sendClientMessage(caster.rightHand.descTextFor(caster, this.potency));
  }
}
