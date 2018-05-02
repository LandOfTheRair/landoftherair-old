
import { SpellEffect } from '../../base/Effect';
import { Character } from '../../../shared/models/character';
import { Skill } from '../../base/Skill';
import { CombatHelper } from '../../helpers/world/combat-helper';

export class Firethorns extends SpellEffect {

  iconData = {
    name: 'barbed-coil',
    color: '#f00',
    tooltipDesc: 'Reflect some physical damage.'
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

    this.aoeAgro(caster, 10);

    target.applyEffect(this);
  }

  effectStart(char: Character) {
    this.targetEffectMessage(char, 'A thorny aura appears around you.');
    this.gainStat(char, 'physicalDamageReflect', this.potency * this.potencyMultiplier);

    this.iconData.tooltipDesc = `Physical attackers take ${this.potency * this.potencyMultiplier} damage. Fire aura deals ${this.potency * this.potencyMultiplier} in a 1x1.`;
  }

  effectTick(char: Character) {
    const damage = this.potency * this.potencyMultiplier;

    char.$$room.state.getAllHostilesInRange(char, 1).forEach(target => {
      CombatHelper.magicalAttack(char, target, {
        effect: this,
        defMsg: `You are overwhelmed by the surrounding warmth!`,
        damage: damage,
        damageClass: 'fire'
      });
    });
  }

  effectEnd(char: Character) {
    this.effectMessage(char, 'Your thorny aura fades.');
  }
}
