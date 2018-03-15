
import { startCase } from 'lodash';

import { AugmentSpellEffect, SpellEffect } from '../../base/Effect';
import { Character } from '../../../shared/models/character';
import { Skill } from '../../base/Skill';

import * as Effects from '../index';

export class Applied extends SpellEffect implements AugmentSpellEffect {

  iconData = {
    name: 'bloody-sword',
    color: '#050',
    tooltipDesc: 'Applied an effect to weapon attacks.'
  };

  private appliedEffect: any;

  cast(caster: Character, target: Character, skillRef?: Skill) {
    this.setPotencyAndGainSkill(caster, skillRef);
    this.flagUnapply();
    this.flagCasterName(caster.name);

    if(!this.duration) this.duration = 30;

    this.aoeAgro(caster, 10);

    target.applyEffect(this);
  }

  effectStart(char: Character) {
    this.targetEffectMessage(char, `Your weapons are now laced with ${startCase(this.appliedEffect.name)}.`);

    this.iconData.tooltipDesc = `Physical attacks apply ${startCase(this.appliedEffect.name)}.`;
  }

  effectEnd(char: Character) {
    this.effectMessage(char, 'Your hands lose their blue glow.');
  }

  augmentAttack(attacker: Character, defender: Character, opts: { damage: number, damageClass: string }) {

    if(opts.damageClass !== 'physical') return;

    const eff = new Effects[this.appliedEffect.name](this.appliedEffect);
    eff.cast(defender, defender);
  }
}
