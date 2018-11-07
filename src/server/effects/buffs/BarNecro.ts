
import { SpellEffect } from '../../base/Effect';
import { Character } from '../../../shared/models/character';
import { Skill } from '../../base/Skill';

export class BarNecro extends SpellEffect {

  iconData = {
    name: 'rosa-shield',
    bgColor: '#1b390e',
    color: '#fff',
    tooltipDesc: 'Negate some necrotic damage.'
  };

  maxSkillForSkillGain = 7;
  potencyMultiplier = 20;
  private diseasePoisonResistMultiplier = 1;

  cast(caster: Character, target: Character, skillRef?: Skill) {
    this.setPotencyAndGainSkill(caster, skillRef);
    this.flagUnapply();
    this.flagCasterName(caster.name);

    if(!this.duration) this.duration = 100 * this.potency;
    this.updateDurationBasedOnTraits(caster);

    if(caster !== target) {
      this.casterEffectMessage(caster, { message: `You cast BarNecro on ${target.name}.`, sfx: 'spell-buff-protection' });
    }

    this.aoeAgro(caster, 10);

    this.diseasePoisonResistMultiplier = caster.getTraitLevelAndUsageModifier('NecroticResistBoost') || 1;

    target.applyEffect(this);
  }

  effectStart(char: Character) {
    this.targetEffectMessage(char, { message: 'Your body builds a temporary resistance to the dark arts.', sfx: 'spell-buff-protection' });
    this.gainStat(char, 'necroticResist', this.potency * this.potencyMultiplier);
    this.gainStat(char, 'poisonResist', this.potency * this.diseasePoisonResistMultiplier * 3);
    this.gainStat(char, 'diseaseResist', this.potency * this.diseasePoisonResistMultiplier * 2);

    this.iconData.tooltipDesc = `Negates ${this.potency * this.potencyMultiplier} necrotic damage, 
      ${this.potency * this.diseasePoisonResistMultiplier * 3} poison damage, 
      and ${this.potency * this.diseasePoisonResistMultiplier * 2} disease damage.`;
  }

  effectEnd(char: Character) {
    this.effectMessage(char, 'Your dark arts resistance fades.');
  }
}
