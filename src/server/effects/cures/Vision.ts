
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
    const blinded = char.hasEffect('Blinded');

    if(!blinded) return;

    if(this.potency < blinded.setPotency) {
      this.effectMessage(char, 'Your blindess was not able to be cured!');
      return;
    }

    if(blinded) {
      char.unapplyEffect(blinded);
    }

    this.effectMessage(char, 'Your eyes can see again.');
  }
}
