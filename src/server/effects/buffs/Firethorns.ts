
import { SpellEffect } from '../../base/Effect';
import { Character } from '../../../shared/models/character';
import { Skill } from '../../base/Skill';

export class Firethorns extends SpellEffect {

  iconData = {
    name: 'barbed-coil',
    bgColor: '#f00',
    color: '#fff',
    tooltipDesc: 'Reflect some physical damage as fire.'
  };

  maxSkillForSkillGain = 30;
  potencyMultiplier = 3;

  cast(caster: Character, target: Character, skillRef?: Skill) {
    this.setPotencyAndGainSkill(caster, skillRef);
    this.flagUnapply();
    this.flagCasterName(caster.name);

    if(!this.duration) this.duration = 30 * this.potency;
    this.updateDurationBasedOnTraits(caster);

    if(caster !== target) {
      this.casterEffectMessage(caster, `You cast Firethorns on ${target.name}.`);
    }

    target.applyEffect(this);
  }

  effectStart(char: Character) {
    this.targetEffectMessage(char, 'A thorny aura appears around you.');
    char.gainStat('physicalDamageReflect', this.potency * this.potencyMultiplier);

    this.iconData.tooltipDesc = `Physical attackers take ${this.potency * this.potencyMultiplier} fire damage.`;
  }

  effectEnd(char: Character) {
    this.effectMessage(char, 'Your thorny aura fades.');
    char.loseStat('physicalDamageReflect', this.potency * this.potencyMultiplier);
  }
}
