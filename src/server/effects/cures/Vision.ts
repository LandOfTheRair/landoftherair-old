
import { SpellEffect } from '../../base/Effect';
import { Character } from '../../../shared/models/character';
import { Skill } from '../../base/Skill';

export class Vision extends SpellEffect {

  maxSkillForSkillGain = 7;

  cast(caster: Character, target: Character, skillRef?: Skill) {
    this.setPotencyAndGainSkill(caster, skillRef);

    if(caster !== target) {
      this.casterEffectMessage(caster, `You cast Vision on ${target.name}.`);
    }

    this.aoeAgro(caster, 1);

    target.applyEffect(this);
  }

  effectStart(char: Character) {
    const blinded = char.hasEffect('Blind');
    const blurred = char.hasEffect('BlurredVision');

    if(blinded) {
      if(this.potency < blinded.setPotency) {
        this.effectMessage(char, 'Your blindess was not able to be cured!');
      } else {
        char.unapplyEffect(blinded);
      }
    }

    if(blurred) {
      if(this.potency < blurred.setPotency) {
        this.effectMessage(char, 'Your blurred vision was not able to be cured!');
      } else {
        char.unapplyEffect(blurred);
      }
    }

    this.effectMessage(char, 'Your eyes can see again.');
  }
}
