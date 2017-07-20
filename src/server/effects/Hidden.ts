
import { SpellEffect } from '../base/Effect';
import { Character, SkillClassNames } from '../../models/character';
import { Skill } from '../base/Skill';

export class Hidden extends SpellEffect {

  iconData = {
    name: 'hidden',
    color: '#ccc',
    bgColor: '#000'
  };

  cast(caster: Character, target: Character, skillRef?: Skill) {

    const casterThiefSkill = caster.calcSkillLevel(SkillClassNames.Thievery);

    const skillGained = 5 - casterThiefSkill;
    if(skillRef && skillGained > 0) {
      caster.gainSkill(SkillClassNames.Thievery, skillGained);
    }

    this.duration = -1;
    this.effectInfo = { isPermanent: true, stats: { hideLevel: caster.hideLevel() } };
    caster.applyEffect(this);
  }

  effectStart(char: Character) {
    this.effectMessage(char, 'You step into the shadows.');
  }

  effectTick(char: Character) {
    if(char.canHide()) return;

    char.unapplyEffect(this);
  }

  effectEnd(char: Character) {
    this.effectMessage(char, 'You are no longer hidden!');
  }
}
