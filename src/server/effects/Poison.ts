
import { SpellEffect } from '../base/Effect';
import { Character, SkillClassNames } from '../../shared/models/character';
import { CombatHelper } from '../helpers/combat-helper';
import { Skill } from '../base/Skill';
import * as dice from 'dice.js';

export class Poison extends SpellEffect {

  iconData = {
    name: 'poison-gas',
    color: '#0a0',
    tooltipDesc: 'Constantly receiving necrotic damage.'
  };

  maxSkillForSkillGain = 7;
  skillFlag = (caster) => {
    if(caster.baseClass === 'Healer')   return SkillClassNames.Restoration;
    return SkillClassNames.Thievery;
  }
  skillMults = [[0, 1], [11, 1.25], [21, 2.5]];

  cast(caster: Character, target: Character, skillRef?: Skill) {

    this.setPotencyAndGainSkill(caster, skillRef);

    let mult = this.getMultiplier();

    if(caster.baseClass === 'Thief') mult = Math.floor(mult * 1.5);

    const wisCheck = this.getTotalDamageDieSize(caster);
    const totalPotency = this.getTotalDamageRolls(caster);
    const damage = +dice.roll(`${totalPotency}d${wisCheck}`);

    const durationAdjust = Math.floor(this.potency / 2);

    this.duration = this.duration || +dice.roll(`${durationAdjust}d5`);

    this.effectInfo = { damage, caster: caster.uuid };
    target.applyEffect(this);
    this.effectMessage(caster, `You poisoned ${target.name}!`);
  }

  effectStart(char: Character) {
    this.effectMessage(char, 'You were poisoned!');
  }

  effectTick(char: Character) {
    const caster = char.$$room.state.findPlayer(this.effectInfo.caster);

    CombatHelper.magicalAttack(caster, char, {
      effect: this,
      defMsg: `You are poisoned!`,
      damage: this.effectInfo.damage,
      damageClass: 'necrotic'
    });

  }

  effectEnd(char: Character) {
    this.effectMessage(char, 'Your body flushed the poison out.');
  }
}
