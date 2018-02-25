
import { SpellEffect } from '../../base/Effect';
import { Character, SkillClassNames } from '../../../shared/models/character';
import { Skill } from '../../base/Skill';

export class BarFrost extends SpellEffect {

  iconData = {
    name: 'rosa-shield',
    bgColor: '#000080',
    color: '#fff',
    tooltipDesc: 'Negate some ice damage.'
  };

  maxSkillForSkillGain = 7;
  potencyMultiplier = 20;
  skillFlag = (caster) => {
    if(caster.baseClass === 'Healer') return SkillClassNames.Restoration;
    if(caster.baseClass === 'Mage')   return SkillClassNames.Conjuration;
    return SkillClassNames.Thievery;
  }

  cast(caster: Character, target: Character, skillRef?: Skill) {
    this.setPotencyAndGainSkill(caster, skillRef);

    if(!this.duration) this.duration = 100 * caster.calcSkillLevel(this.skillFlag(caster));
    this.updateDurationBasedOnTraits(caster);

    if(caster !== target) {
      this.casterEffectMessage(caster, `You cast BarFrost on ${target.name}.`);
    }

    target.applyEffect(this);
  }

  effectStart(char: Character) {
    this.targetEffectMessage(char, 'Your body builds a temporary resistance to frost.');
    char.gainStat('iceResist', this.potency * this.potencyMultiplier);
  }

  effectEnd(char: Character) {
    this.effectMessage(char, 'Your frost resistance fades.');
    char.loseStat('iceResist', this.potency * this.potencyMultiplier);
  }
}