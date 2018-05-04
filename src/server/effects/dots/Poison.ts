
import { SpellEffect } from '../../base/Effect';
import { Character } from '../../../shared/models/character';
import { CombatHelper } from '../../helpers/world/combat-helper';
import { Skill } from '../../base/Skill';
import * as dice from 'dice.js';
import { RollerHelper } from '../../../shared/helpers/roller-helper';

export class Poison extends SpellEffect {

  iconData = {
    name: 'poison-gas',
    color: '#0a0',
    tooltipDesc: 'Constantly receiving poison damage.'
  };

  maxSkillForSkillGain = 25;
  skillMults = [[0, 1], [6, 1.25], [11, 1.5], [16, 1.75], [21, 2]];

  private critBonus: number;
  private healerCripple: number;
  private thiefCorrode: number;

  cast(caster: Character, target: Character, skillRef?: Skill) {

    this.setPotencyAndGainSkill(caster, skillRef);

    let mult = this.getMultiplier();

    /** PERK:CLASS:THIEF:Thieves have poison that does 150% damage. */
    if(caster.baseClass === 'Thief') mult = Math.floor(mult * 1.5);

    const wisCheck = this.getTotalDamageDieSize(caster);
    const totalPotency = Math.floor(mult * this.getTotalDamageRolls(caster));
    const damage = +dice.roll(`${totalPotency}d${wisCheck}`);

    this.duration = this.duration || this.potency;

    const natureSpirit = caster.getTraitLevelAndUsageModifier('NatureSpirit');
    this.critBonus = natureSpirit;

    this.duration += caster.getTraitLevel('NatureSpirit');

    if(caster.getTraitLevel('CripplingPoison')) {
      this.healerCripple = Math.round(this.potency / 5);
    }

    if(caster.getTraitLevel('CorrosivePoison')) {
      this.thiefCorrode = Math.round(this.potency / 5);
    }

    this.effectInfo = { damage, caster: caster.uuid };
    this.flagCasterName(caster.name);
    target.applyEffect(this);
    this.effectMessage(caster, `You poisoned ${target.name}!`);
  }

  effectStart(char: Character) {
    this.effectMessage(char, 'You were poisoned!');

    this.iconData.tooltipDesc = `Constantly receiving ${Math.abs(this.effectInfo.damage)} poison damage.`;

    if(this.healerCripple) {
      this.iconData.tooltipDesc = `${this.iconData.tooltipDesc} Offense/Defense penalty.`;
      this.loseStat(char, 'offense', this.healerCripple);
      this.loseStat(char, 'defense', this.healerCripple);
    }

    if(this.thiefCorrode) {
      this.iconData.tooltipDesc = `${this.iconData.tooltipDesc} Mitigation penalty.`;
      this.loseStat(char, 'mitigation', this.thiefCorrode);
    }
  }

  effectTick(char: Character) {
    const caster = char.$$room.state.findPlayer(this.effectInfo.caster);

    let isCrit = false;

    if(RollerHelper.XInOneHundred(this.critBonus * 100)) {
      isCrit = true;
    }

    CombatHelper.magicalAttack(caster, char, {
      effect: this,
      defMsg: `You are ${isCrit ? 'critically ' : ' '}poisoned!`,
      damage: this.effectInfo.damage * (isCrit ? 3 : 1),
      damageClass: 'poison'
    });

  }

  effectEnd(char: Character) {
    this.effectMessage(char, 'Your body flushed the poison out.');
  }
}
