
import { AugmentSpellEffect, ImbueEffect } from '../../base/Effect';
import { Character } from '../../../shared/models/character';
import { Skill } from '../../base/Skill';
import { RollerHelper } from '../../../shared/helpers/roller-helper';

export class ImbueFlame extends ImbueEffect implements AugmentSpellEffect {

  iconData = {
    name: 'magic-palm',
    color: '#a00',
    tooltipDesc: 'Physical attacks sometimes do bonus fire damage.'
  };

  maxSkillForSkillGain = 21;

  cast(caster: Character, target: Character, skillRef?: Skill) {
    const foundSelf = super.cast(caster, target, skillRef);
    if(foundSelf) return foundSelf;

    this.setPotencyAndGainSkill(caster, skillRef);
    this.flagUnapply();
    this.flagCasterName(caster.name);

    if(!this.duration) this.duration = 30 * this.potency;
    this.updateDurationBasedOnTraits(caster);

    if(caster !== target) {
      this.casterEffectMessage(caster, { message: `You cast Imbue Flame on ${target.name}.`, sfx: 'spell-buff-physical' });
    }

    this.aoeAgro(caster, 10);

    target.applyEffect(this);
  }

  effectStart(char: Character) {
    this.targetEffectMessage(char, { message: 'A whirling red aura envelops your hands.', sfx: 'spell-buff-physical' });

    this.iconData.tooltipDesc = `Physical attacks sometimes do ${Math.floor(this.potency / 2)}% bonus fire damage.`;
  }

  effectEnd(char: Character) {
    this.effectMessage(char, 'Your hands lose their red glow.');
  }

  augmentAttack(attacker: Character, defender: Character, opts: { damage: number, damageClass: string }) {

    if(opts.damageClass !== 'physical') return;
    if(!RollerHelper.XInOneHundred(this.potency)) return;

    const bonusDamage = Math.floor(opts.damage * ((this.potency / 200)));

    this.magicalAttack(attacker, defender, {
      atkMsg: `You strike for bonus fire damage!`,
      defMsg: `%0 struck you with a burst of raw heat!`,
      damage: bonusDamage,
      damageClass: 'fire'
    });
  }
}
