
import { SpellEffect } from '../../base/Effect';
import { Character } from '../../../shared/models/character';
import { Skill } from '../../base/Skill';
import { AttributeEffect } from '../../../shared/interfaces/effect';

export class RecentlyShielded extends SpellEffect {

  iconData = {
    name: 'aura',
    color: '#000',
    tooltipDesc: 'Recently shielded and cannot be shielded for a period.'
  };

  cast(caster: Character, target: Character, skillRef?: Skill) {
    this.duration = Math.floor(10 * caster.getTraitLevelAndUsageModifier('SustainedImmunity'));
    target.applyEffect(this);
  }
}

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
    if(!this.charges) this.charges = 50 * this.potency;
    this.updateBuffDurationBasedOnTraits(caster);

    if(caster !== target) {
      this.casterEffectMessage(caster, { message: `You cast Holy Aura on ${target.name}.`, sfx: 'spell-buff-magical' });
    }

    this.aoeAgro(caster, 100);

    target.applyEffect(this);
  }

  effectStart(char: Character) {
    this.targetEffectMessage(char, { message: 'A holy aura surrounds your body.', sfx: 'spell-buff-magical' });
    this.iconData.tooltipDesc = `Invulnerable to ${this.charges} physical damage.`;
  }

  effectEnd(char: Character) {
    if(this.duration > 15) {
      const recently = new RecentlyShielded({ duration: this.duration - 15 });
      recently.cast(char, char);
    }

    this.effectMessage(char, 'The holy aura fades.');
  }

  modifyDamage(attacker: Character, defender: Character, opts: { damage: number }) {
    if(opts.damage <= 0) return opts.damage;

    this.charges -= opts.damage;
    if(this.charges <= 0) defender.unapplyEffect(this);

    if(this.charges > 0) return 0;
    return -this.charges;
  }
}
