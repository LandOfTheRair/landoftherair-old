
import { SpellEffect, OnHitEffect } from '../../base/Effect';
import { Character } from '../../../shared/models/character';
import { Skill } from '../../base/Skill';

export class VitalEssence extends SpellEffect implements OnHitEffect {

  iconData = {
    name: 'bell-shield',
    bgColor: '#0a0',
    color: '#fff',
    tooltipDesc: 'Grants you more health and armor.'
  };

  maxSkillForSkillGain = 25;
  potencyMultiplier = 10;

  cast(caster: Character, target: Character, skillRef?: Skill) {
    this.setPotencyAndGainSkill(caster, skillRef);
    this.flagUnapply();
    this.flagPermanent(caster.uuid);
    this.flagCasterName(caster.name);

    if(!this.charges) this.charges = 10 * this.potency;
    this.updateDurationBasedOnTraits(caster);

    if(caster !== target) {
      this.casterEffectMessage(caster, `You cast VitalEssence on ${target.name}.`);
    }

    this.aoeAgro(caster, 100);

    target.applyEffect(this);
  }

  effectStart(char: Character) {
    this.targetEffectMessage(char, 'Your body feels more durable.');
    this.gainStat(char, 'hp', this.potency * this.potencyMultiplier);

    const acGain = Math.floor(this.potency / 3);
    this.gainStat(char, 'armorClass', acGain);

    this.iconData.tooltipDesc = `Grants you ${this.potency * this.potencyMultiplier} more health and ${acGain} AC. Each hit you take erodes your essence.`;
  }

  effectEnd(char: Character) {
    this.effectMessage(char, 'Your durability fades.');
  }

  onHit(attacker: Character, defender: Character, { damage }) {
    if(damage <= 0) return;

    this.charges--;
    if(this.charges <= 0) defender.unapplyEffect(this);
  }
}
