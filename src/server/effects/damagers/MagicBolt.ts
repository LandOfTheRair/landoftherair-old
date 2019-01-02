
import { SpellEffect } from '../../base/Effect';
import { Character } from '../../../shared/models/character';
import { Skill } from '../../base/Skill';
import { EnergeticBolts, Stun } from '../';
import { RollerHelper } from '../../../shared/helpers/roller-helper';

export class MagicBolt extends SpellEffect {

  maxSkillForSkillGain = 30;
  skillMults = [[0, 4], [6, 5], [11, 6], [16, 7], [21, 8], [26, 9], [31, 11], [36, 13.5], [41, 17]];

  cast(caster: Character, target: Character, skillRef?: Skill) {
    this.setPotencyAndGainSkill(caster, skillRef);

    let damage = RollerHelper.diceRoll(this.getTotalDamageRolls(caster), this.getTotalDamageDieSize(caster));
    
    const energeticBolts = caster.hasEffect('EnergeticBolts');
    if(energeticBolts) damage += Math.floor(damage * energeticBolts.setPotency * 0.05);

    this.magicalAttack(caster, target, {
      skillRef,
      atkMsg: `You fire a magic bolt at %0!`,
      defMsg: `%0 hit you with a magic bolt!`,
      damage,
      damageClass: 'energy'
    });

    const concussiveChance = caster.getTraitLevelAndUsageModifier('ConcussiveBolt');
    if(RollerHelper.XInOneHundred(concussiveChance)) {
      const stunned = new Stun({ potency: this.potency, duration: 5 });
      stunned.shouldNotShowMessage = true;
      stunned.cast(caster, target);
      stunned.shouldNotShowMessage = false;
    }

    if(caster.getTraitLevel('EnergeticBolts')) {
      const buff = new EnergeticBolts({ potency: energeticBolts ? Math.min(10, energeticBolts.setPotency + 1) : 1 });
      buff.cast(caster, caster);
    }
  }
}
