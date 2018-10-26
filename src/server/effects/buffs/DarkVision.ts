
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
    /** PERK:CLASS:THIEF:Thieves may only cast DarkVision on themselves. */
    if(caster.baseClass === 'Thief') target = caster;
    this.setPotencyAndGainSkill(caster, skillRef);
    this.flagUnapply();
    this.flagCasterName(caster.name);

    if(caster !== target) {
      this.casterEffectMessage(caster, { message: `You cast DarkVision on ${target.name}.`, sfx: 'spell-sight-effect' });
    }

    this.aoeAgro(caster, 10);

    /** PERK:CLASS:THIEF:Thief DarkVision lasts 50% as long. */
    const durationMult = caster.baseClass === 'Thief' ? 50 : 100;
    if(!this.duration) this.duration = this.potency * durationMult;
    this.updateDurationBasedOnTraits(caster);
    target.applyEffect(this);
  }

  effectStart(char: Character) {
    this.targetEffectMessage(char, { message: 'You can see in the dark!', sfx: 'spell-sight-effect' });

    char.$$room.state.calculateFOV(char);
    if(char.isPlayer()) {
      char.$$room.updateFOV(char);
    }
  }

  effectEnd(char: Character) {
    this.effectMessage(char, 'Your vision returns to normal.');

    char.$$room.clock.setTimeout(() => {
      char.$$room.state.calculateFOV(char);
      if(char.isPlayer()) {
        char.$$room.updateFOV(char);
      }
    }, 0);
  }
}
