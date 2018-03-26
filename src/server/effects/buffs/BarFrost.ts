
import { SpellEffect } from '../../base/Effect';
import { Character } from '../../../shared/models/character';
import { Skill } from '../../base/Skill';

export class BarFrost extends SpellEffect {

  iconData = {
    name: 'rosa-shield',
    bgColor: '#000080',
    color: '#fff',
    tooltipDesc: 'Negate some ice damage.'
  };

  maxSkillForSkillGain = 7;
  potencyMultiplier = 20;

  cast(caster: Character, target: Character, skillRef?: Skill) {
    this.setPotencyAndGainSkill(caster, skillRef);
    this.flagUnapply();
    this.flagCasterName(caster.name);

    /** PERK:CLASS:MAGE:Mages have BarFrost that is twice as strong. */
    if(caster.baseClass === 'Mage') this.potencyMultiplier *= 2;

    if(!this.duration) this.duration = 100 * this.potency;
    this.updateDurationBasedOnTraits(caster);

    if(caster !== target) {
      this.casterEffectMessage(caster, `You cast BarFrost on ${target.name}.`);
    }

    this.aoeAgro(caster, 10);

    target.applyEffect(this);
  }

  effectStart(char: Character) {
    this.targetEffectMessage(char, 'Your body builds a temporary resistance to frost.');
    char.gainStat('iceResist', this.potency * this.potencyMultiplier);

    this.iconData.tooltipDesc = `Negates ${this.potency * this.potencyMultiplier} ice damage.`;
  }

  effectEnd(char: Character) {
    this.effectMessage(char, 'Your frost resistance fades.');
    char.loseStat('iceResist', this.potency * this.potencyMultiplier);
  }
}
