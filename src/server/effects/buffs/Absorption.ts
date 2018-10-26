
import { SpellEffect } from '../../base/Effect';
import { Character } from '../../../shared/models/character';
import { Skill } from '../../base/Skill';

export class Absorption extends SpellEffect {

  iconData = {
    name: 'magic-swirl',
    bgColor: '#a0a',
    color: '#fff',
    tooltipDesc: 'Negates some magic damage.'
  };

  maxSkillForSkillGain = 15;
  potencyMultiplier = 4;

  cast(caster: Character, target: Character, skillRef?: Skill) {
    this.setPotencyAndGainSkill(caster, skillRef);
    this.flagUnapply();
    this.flagCasterName(caster.name);

    if(!this.duration) this.duration = 30 * this.potency;
    this.updateDurationBasedOnTraits(caster);

    if(caster !== target) {
      this.casterEffectMessage(caster, { message: `You cast Absorption on ${target.name}.`, sfx: 'spell-buff-magical' });
    }

    this.aoeAgro(caster, 10);

    target.applyEffect(this);
  }

  effectStart(char: Character) {
    this.targetEffectMessage(char, { message: 'Your body builds a temporary resistance to magic.', sfx: 'spell-buff-magical' });
    this.gainStat(char, 'magicalResist', this.potency * this.potencyMultiplier);

    this.iconData.tooltipDesc = `Negates ${this.potency * this.potencyMultiplier} magic damage.`;
  }

  effectEnd(char: Character) {
    this.effectMessage(char, 'Your magic resistance fades.');
  }
}
