
import { SpellEffect, AttributeEffect } from '../../base/Effect';
import { Character } from '../../../shared/models/character';
import { Skill } from '../../base/Skill';

export class HolyAura extends SpellEffect implements AttributeEffect {

  iconData = {
    name: 'aura',
    bgColor: '#aa0',
    color: '#fff',
    tooltipDesc: 'Invulnerable to some physical damage.'
  };

  maxSkillForSkillGain = 15;

  cast(caster: Character, target: Character, skillRef?: Skill) {
    this.setPotencyAndGainSkill(caster, skillRef);
    this.flagUnapply();
    this.flagCasterName(caster.name);

    if(!this.duration) this.duration = 30;
    if(!this.charges) this.charges = 30 * this.potency;
    this.updateDurationBasedOnTraits(caster);

    if(caster !== target) {
      this.casterEffectMessage(caster, `You cast Holy Aura on ${target.name}.`);
    }

    this.aoeAgro(caster, 100);

    target.applyEffect(this);
  }

  effectStart(char: Character) {
    this.targetEffectMessage(char, 'A holy aura surrounds your body.');
    this.iconData.tooltipDesc = `Invulnerable to ${this.potency} physical damage.`;
  }

  effectEnd(char: Character) {
    if(this.duration > 15) {
      const recently = new RecentlyShielded({ duration: this.duration - 15 });
      recently.cast(char, char);
    }

    this.effectMessage(char, 'The holy aura fades.');
  }

  modifyDamage(attacker: Character, defender: Character, opts: { damage: number }) {
    this.charges -= opts.damage;
    if(this.charges <= 0) defender.unapplyEffect(this);

    if(this.charges > 0) return 0;
    return -this.charges;
  }
}

export class RecentlyShielded extends SpellEffect {

  iconData = {
    name: 'aura',
    color: '#000',
    tooltipDesc: 'Recently shielded and cannot be shielded for a period.'
  };

  cast(caster: Character, target: Character, skillRef?: Skill) {
    this.duration = 15;
    target.applyEffect(this);
  }
}
