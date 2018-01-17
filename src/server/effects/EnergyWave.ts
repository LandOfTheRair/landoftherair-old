
import { SpellEffect } from '../base/Effect';
import { Character, SkillClassNames } from '../../shared/models/character';
import { Skill } from '../base/Skill';
import * as dice from 'dice.js';

export class EnergyWave extends SpellEffect {

  maxSkillForSkillGain = 11;
  skillFlag = () => SkillClassNames.Conjuration;

  cast(caster: Character, target: Character, skillRef?: Skill) {
    this.setPotencyAndGainSkill(caster, skillRef);

    let mult = 0.5;
    if(this.potency > 0)  mult = 1.5;
    if(this.potency > 11) mult = 2.5;
    if(this.potency > 21) mult = 3.5;

    const intCheck = Math.floor(mult * this.getCasterStat(caster, 'int'));

    target.sendClientMessageToRadius({ message: `You feel a wave of energy pulse outwards from ${target.name}.`, subClass: 'combat magic' }, 5, [caster.uuid]);

    const attacked = target.$$room.state.getAllInRange(target, 2, [caster.uuid]);

    attacked.forEach(refTarget => {
      const damage = +dice.roll(`${this.potency || 1}d${intCheck}`);

      const atkName = refTarget.name;

      this.magicalAttack(caster, refTarget, {
        skillRef,
        atkMsg: `You blast ${atkName} with a wave of energy!`,
        defMsg: `${caster.name} blasted you with a wave of energy!`,
        damage,
        damageClass: 'energy'
      });
    });
  }
}
