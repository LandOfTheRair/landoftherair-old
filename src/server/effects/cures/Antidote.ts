
import { SpellEffect } from '../../base/Effect';
import { Character } from '../../../shared/models/character';
import { Skill } from '../../base/Skill';

export class Antidote extends SpellEffect {

  maxSkillForSkillGain = 7;

  cast(caster: Character, target: Character, skillRef?: Skill) {
    this.setPotencyAndGainSkill(caster, skillRef);

    if(caster !== target) {
      this.casterEffectMessage(caster, `You cast Antidote on ${target.name}.`);
    }

    target.applyEffect(this);
  }

  effectStart(char: Character) {
    const poison = char.hasEffect('Poison');

    if(!poison) return;

    if(this.potency < poison.setPotency) {
      this.effectMessage(char, 'Your poison was not able to be cured!');
      return;
    }

    if(poison) {
      char.unapplyEffect(poison);
    }

    this.effectMessage(char, 'Your stomach feels better.');
  }
}
