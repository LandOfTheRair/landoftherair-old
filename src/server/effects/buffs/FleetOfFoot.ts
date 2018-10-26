
import { SpellEffect } from '../../base/Effect';
import { Character } from '../../../shared/models/character';
import { Skill } from '../../base/Skill';

export class FleetOfFoot extends SpellEffect {

  iconData = {
    name: 'wingfoot',
    color: '#0aa',
    tooltipDesc: 'Immune to prone and resistant to combat stun.'
  };

  maxSkillForSkillGain = 15;
  potencyMultiplier = 20;

  cast(caster: Character, target: Character, skillRef?: Skill) {
    this.setPotencyAndGainSkill(caster, skillRef);
    this.flagUnapply();
    this.flagCasterName(caster.name);

    if(caster !== target) {
      this.casterEffectMessage(caster, { message: `You cast FleetOfFoot on ${target.name}.`, sfx: 'spell-buff-physical' });
    }

    this.aoeAgro(caster, 10);

    if(!this.duration) this.duration = this.potency * 30;
    this.updateDurationBasedOnTraits(caster);

    target.applyEffect(this);
  }

  effectStart(char: Character) {
    this.targetEffectMessage(char, { message: 'You feel light on your feet!', sfx: 'spell-buff-physical' });
  }

  effectEnd(char: Character) {
    this.effectMessage(char, 'You feel the full weight of your body once more.');
  }
}
