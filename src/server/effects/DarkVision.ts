
import { SpellEffect } from '../base/Effect';
import { Character, SkillClassNames } from '../../shared/models/character';
import { Skill } from '../base/Skill';

export class DarkVision extends SpellEffect {

  iconData = {
    name: 'angry-eyes',
    color: '#000',
    tooltipDesc: 'Seeing in the dark.'
  };

  maxSkillForSkillGain = 13;
  skillFlag = (caster) => {
    if(caster.baseClass === 'Mage')   return SkillClassNames.Conjuration;
    return SkillClassNames.Thievery;
  }

  cast(caster: Character, target: Character, skillRef?: Skill) {
    if(caster.baseClass === 'Thief') target = caster;
    this.setPotencyAndGainSkill(caster, skillRef);

    if(caster !== target) {
      this.casterEffectMessage(caster, `You cast DarkVision on ${target.name}.`);
    }

    const usedSkill = this.skillFlag(caster);
    const durationMult = caster.baseClass === 'Mage' ? 100 : 50;
    if(!this.duration) this.duration = caster.calcSkillLevel(usedSkill) * durationMult;
    target.applyEffect(this);

    target.$$room.state.calculateFOV(target);
    if(target.isPlayer()) {
      target.$$room.updateFOV(target);
    }
  }

  effectStart(char: Character) {
    this.targetEffectMessage(char, 'You can see in the dark!');
  }

  effectEnd(char: Character) {
    this.effectMessage(char, 'Your vision returns to normal.');
  }
}
