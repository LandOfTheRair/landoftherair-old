
import { SpellEffect } from '../../base/Effect';
import { Character } from '../../../shared/models/character';
import { CombatHelper } from '../../helpers/world/combat-helper';
import { Skill } from '../../base/Skill';
import * as dice from 'dice.js';
import { RollerHelper } from '../../../shared/helpers/roller-helper';

export class Disease extends SpellEffect {

  iconData = {
    name: 'death-juice',
    color: '#0a0',
    tooltipDesc: 'Constantly receiving disease damage.'
  };

  maxSkillForSkillGain = 25;
  skillMults = [[0, 2], [6, 2.5], [11, 3], [16, 3.5], [21, 4]];

  private critBonus: number;
  private healerDebilitate: number;
  private thiefDegenerate: number;

  cast(caster: Character, target: Character, skillRef?: Skill) {

    this.setPotencyAndGainSkill(caster, skillRef);

    let mult = this.getMultiplier();

    /** PERK:CLASS:THIEF:Thieves have disease that does 150% damage. */
    if(caster.baseClass === 'Thief') mult = Math.floor(mult * 1.5);

    const calcMod = Math.max(1, this.getCoreStat(caster) - target.getTotalStat('con'));

    const wisCheck = Math.max(1, Math.floor(mult * calcMod));
    const totalPotency = this.getTotalDamageRolls(caster);
    const damage = +dice.roll(`${totalPotency}d${wisCheck}`);

    this.duration = this.duration || this.potency * 2;

    const natureSpirit = caster.getTraitLevelAndUsageModifier('NatureSpirit');
    this.critBonus = natureSpirit;

    this.duration += caster.getTraitLevel('NatureSpirit');

    if(caster.getTraitLevel('DebilitatingDisease')) {
      this.healerDebilitate = Math.max(1, Math.round(this.potency / 10));
    }

    if(caster.getTraitLevel('DegenerativeDisease')) {
      this.thiefDegenerate = this.potency;
    }

    this.effectInfo = { damage, caster: caster.uuid };
    this.flagCasterName(caster.name);
    target.applyEffect(this);
    this.effectMessage(caster, `You diseased ${target.name}!`);
  }

  effectStart(char: Character) {
    this.effectMessage(char, 'You were diseased!');

    this.iconData.tooltipDesc = `Constantly receiving ${Math.abs(this.effectInfo.damage)} disease damage.`;

    if(this.healerDebilitate) {
      this.iconData.tooltipDesc = `${this.iconData.tooltipDesc} CON/WIL/Accuracy penalty.`;
      this.loseStat(char, 'wil', this.healerDebilitate);
      this.loseStat(char, 'con', this.healerDebilitate);
      this.loseStat(char, 'accuracy', this.healerDebilitate);
    }

    if(this.thiefDegenerate) {
      this.iconData.tooltipDesc = `${this.iconData.tooltipDesc} Perception penalty.`;
      this.loseStat(char, 'perception', this.thiefDegenerate);
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
      defMsg: `You are ${isCrit ? 'critically ' : ' '}diseased!`,
      damage: this.effectInfo.damage * (isCrit ? 3 : 1),
      damageClass: 'disease'
    });

  }

  effectEnd(char: Character) {
    this.effectMessage(char, 'Your body recovered from the disease.');
  }
}
