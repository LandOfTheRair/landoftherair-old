
import { SpellEffect } from '../../base/Effect';
import { Character } from '../../../shared/models/character';
import { Skill } from '../../base/Skill';

export class Disguise extends SpellEffect {

  iconData = {
    name: 'duality',
    color: '#111',
    tooltipDesc: 'Blending in with enemies.'
  };

  maxSkillForSkillGain = 20;

  cast(caster: Character, target: Character, skillRef?: Skill) {
    this.setPotencyAndGainSkill(caster, skillRef);
    this.flagUnapply();
    this.flagCasterName(caster.name);

    if(!this.duration) this.duration = 5 * this.potency;

    if(caster !== target) {
      this.casterEffectMessage(caster, `You cast Disguise on ${target.name}.`);
    }

    target.applyEffect(this);
  }

  effectStart(char: Character) {
    this.targetEffectMessage(char, 'You put on your best goblin mask!');
  }

  effectEnd(char: Character) {
    this.effectMessage(char, 'Your goblin mask falls off.');
  }
}
