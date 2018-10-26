
import { SpellEffect } from '../../base/Effect';
import { Character } from '../../../shared/models/character';
import { Skill } from '../../base/Skill';

import { sample } from 'lodash';

export class Dispel extends SpellEffect {

  maxSkillForSkillGain = 25;

  cast(caster: Character, target: Character, skillRef?: Skill) {
    this.setPotencyAndGainSkill(caster, skillRef);
    this.aoeAgro(caster, 10);

    const effects = target.dispellableEffects;
    if(effects.length === 0) return;

    target.addAgro(caster, 5);

    target.sendClientMessage({ message: `${caster.name} dispelled a buff from you!`, sfx: 'spell-debuff-give' });
    caster.sendClientMessage({ message: `You dispelled a buff on ${target.name}!`, sfx: 'spell-debuff-receive' });

    const effect = sample(effects);
    target.unapplyEffect(effect, true, true);
  }
}
