
import { SpellEffect } from '../../base/Effect';
import { Character } from '../../../shared/models/character';
import { Skill } from '../../base/Skill';

export class DarkVision extends SpellEffect {

  iconData = {
    name: 'angry-eyes',
    color: '#000',
    tooltipDesc: 'Seeing in the dark.'
  };

  maxSkillForSkillGain = 13;

  cast(caster: Character, target: Character, skillRef?: Skill) {
    if(caster.baseClass === 'Thief') target = caster;
    this.setPotencyAndGainSkill(caster, skillRef);
    this.flagUnapply();
    this.flagCasterName(caster.name);

    if(caster !== target) {
      this.casterEffectMessage(caster, `You cast DarkVision on ${target.name}.`);
    }

    this.aoeAgro(caster, 10);

    const durationMult = caster.baseClass === 'Mage' ? 100 : 50;
    if(!this.duration) this.duration = this.potency * durationMult;
    this.updateDurationBasedOnTraits(caster);
    target.applyEffect(this);
  }

  effectStart(char: Character) {
    this.targetEffectMessage(char, 'You can see in the dark!');

    char.$$room.state.calculateFOV(char);
    if(char.isPlayer()) {
      char.$$room.updateFOV(char);
    }
  }

  effectEnd(char: Character) {
    this.effectMessage(char, 'Your vision returns to normal.');

    char.$$room.state.calculateFOV(char);
    if(char.isPlayer()) {
      char.$$room.updateFOV(char);
    }
  }
}
