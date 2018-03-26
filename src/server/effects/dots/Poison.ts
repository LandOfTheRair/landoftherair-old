
import { SpellEffect } from '../../base/Effect';
import { Character } from '../../../shared/models/character';
import { CombatHelper } from '../../helpers/world/combat-helper';
import { Skill } from '../../base/Skill';
import * as dice from 'dice.js';

export class Poison extends SpellEffect {

  iconData = {
    name: 'poison-gas',
    color: '#0a0',
    tooltipDesc: 'Constantly receiving necrotic damage.'
  };

  maxSkillForSkillGain = 7;
  skillMults = [[0, 1], [11, 1.25], [21, 2.5]];

  cast(caster: Character, target: Character, skillRef?: Skill) {

    this.setPotencyAndGainSkill(caster, skillRef);

    let mult = this.getMultiplier();

    /** PERK:CLASS:THIEF:Thieves have poison that does 150% damage. */
    if(caster.baseClass === 'Thief') mult = Math.floor(mult * 1.5);

    const wisCheck = this.getTotalDamageDieSize(caster);
    const totalPotency = Math.floor(mult * this.getTotalDamageRolls(caster));
    const damage = +dice.roll(`${totalPotency}d${wisCheck}`);

    this.duration = this.duration || this.potency;

    this.effectInfo = { damage, caster: caster.uuid };
    this.flagCasterName(caster.name);
    target.applyEffect(this);
    this.effectMessage(caster, `You poisoned ${target.name}!`);
  }

  effectStart(char: Character) {
    this.effectMessage(char, 'You were poisoned!');

    this.iconData.tooltipDesc = `Constantly receiving ${Math.abs(this.effectInfo.damage)} necrotic damage.`;
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
