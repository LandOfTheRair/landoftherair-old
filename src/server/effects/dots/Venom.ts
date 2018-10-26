
import { SpellEffect } from '../../base/Effect';
import { Character } from '../../../shared/models/character';
import { CombatHelper } from '../../helpers/world/combat-helper';
import { Skill } from '../../base/Skill';
import * as dice from 'dice.js';
import { RollerHelper } from '../../../shared/helpers/roller-helper';

export class Venom extends SpellEffect {

  iconData = {
    name: 'dripping-goo',
    color: '#0a0',
    tooltipDesc: 'Constantly receiving poison damage.'
  };

  maxSkillForSkillGain = 25;
  skillMults = [[0, 1], [6, 1.5], [11, 2], [16, 2.5], [21, 3]];

  private critBonus: number;
  private thiefDegenerate: number;

  cast(caster: Character, target: Character, skillRef?: Skill) {

    this.setPotencyAndGainSkill(caster, skillRef);

    const mult = this.getMultiplier();

    const wisCheck = this.getTotalDamageDieSize(caster);
    const totalPotency = Math.floor(mult * this.getTotalDamageRolls(caster));
    const damage = RollerHelper.diceRoll(totalPotency, wisCheck);

    this.duration = this.duration || this.potency;

    if(caster.getTraitLevel('DegenerativeVenom')) {
      this.thiefDegenerate = this.potency;
    }

    this.effectInfo = { damage, caster: caster.uuid };
    this.flagCasterName(caster.name);
    target.applyEffect(this);
    this.effectMessage(caster, { message: `You inflicted ${target.name} with a deadly venom!`, sfx: 'spell-debuff-give' });
  }

  effectStart(char: Character) {
    this.effectMessage(char, { message: 'You feel a deadly venom coursing through your veins!', sfx: 'spell-debuff-receive' });

    if(this.thiefDegenerate) {
      this.iconData.tooltipDesc = `${this.iconData.tooltipDesc} Perception penalty.`;
      this.loseStat(char, 'perception', this.thiefDegenerate);
    }
  }

  effectTick(char: Character) {
    const caster = char.$$room.state.findCharacter(this.effectInfo.caster);

    let isCrit = false;

    if(RollerHelper.XInOneHundred(this.critBonus * 100)) {
      isCrit = true;
    }

    CombatHelper.magicalAttack(caster, char, {
      effect: this,
      atkMsg: `${char.name} is ${isCrit ? 'critically ' : ''}envenomed!`,
      defMsg: `You are ${isCrit ? 'critically ' : ''}envenomed!`,
      damage: this.effectInfo.damage * (isCrit ? 3 : 1),
      damageClass: 'poison',
      isOverTime: true
    });

  }

  effectEnd(char: Character) {
    this.effectMessage(char, 'Your body expelled the venom.');
  }
}
