
import { random } from 'lodash';

import { AugmentSpellEffect, SpellEffect } from '../../base/Effect';
import { Character } from '../../../shared/models/character';
import { Skill } from '../../base/Skill';

export class ImbueEnergy extends SpellEffect implements AugmentSpellEffect {

  iconData = {
    name: 'magic-palm',
    color: '#00b',
    tooltipDesc: 'Physical attacks sometimes do bonus energy damage.'
  };

  maxSkillForSkillGain = 21;
  potencyMultiplier = 10;

  cast(caster: Character, target: Character, skillRef?: Skill) {
    this.setPotencyAndGainSkill(caster, skillRef);
    this.flagUnapply();
    this.flagCasterName(caster.name);

    if(!this.duration) this.duration = 30 * this.potency;
    this.updateDurationBasedOnTraits(caster);

    if(caster !== target) {
      this.casterEffectMessage(caster, `You cast Imbue Energy on ${target.name}.`);
    }

    this.aoeAgro(caster, 10);

    target.applyEffect(this);
  }

  effectStart(char: Character) {
    this.targetEffectMessage(char, 'A whirling blue aura envelops your hands.');

    this.iconData.tooltipDesc = `Physical attacks sometimes do ${this.potency * this.potencyMultiplier} bonus energy damage.`;
  }

  effectEnd(char: Character) {
    this.effectMessage(char, 'Your hands lose their blue glow.');
  }

  augmentAttack(attacker: Character, defender: Character, opts: { damage: number, damageClass: string }) {

    if(opts.damageClass !== 'physical') return;
    if(random(0, 100) > this.potency) return;

    this.magicalAttack(attacker, defender, {
      atkMsg: `You strike for bonus energy damage!`,
      defMsg: `${attacker.name} struck you with a burst of raw energy!`,
      damage: this.potency * this.potencyMultiplier,
      damageClass: 'energy'
    });
  }
}
