
import { SpellEffect } from '../../base/Effect';
import { Character } from '../../../shared/models/character';
import { Skill } from '../../base/Skill';

export class VitalEssence extends SpellEffect {

  iconData = {
    name: 'bell-shield',
    bgColor: '#0a0',
    color: '#fff',
    tooltipDesc: 'Grants you more health.'
  };

  maxSkillForSkillGain = 25;
  potencyMultiplier = 10;

  cast(caster: Character, target: Character, skillRef?: Skill) {
    this.setPotencyAndGainSkill(caster, skillRef);
    this.flagUnapply();
    this.flagCasterName(caster.name);

    if(!this.duration) this.duration = 30 * this.potency;
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
    this.gainStat(char, 'armorClass', this.potency);

    this.iconData.tooltipDesc = `Grants you ${this.potency * this.potencyMultiplier} more health and ${this.potency} AC.`;
  }

  effectEnd(char: Character) {
    this.effectMessage(char, 'Your durability fades.');
  }
}
