
import { SpellEffect } from '../../base/Effect';
import { Character } from '../../../shared/models/character';
import { Skill } from '../../base/Skill';
import * as dice from 'dice.js';
import { Light } from '../misc/Light';
import { RollerHelper } from '../../../shared/helpers/roller-helper';
import { CombatHelper } from '../../helpers/world/combat-helper';

export class RecentlyPurified extends SpellEffect {

  iconData = {
    name: 'fireflake',
    color: '#000',
    tooltipDesc: 'Recently purified and cannot be purified for a period.'
  };

  cast(caster: Character, target: Character, skillRef?: Skill) {
    this.duration = 10;
    target.applyEffect(this);
  }
}

export class HolyFire extends SpellEffect {

  maxSkillForSkillGain = 30;
  skillMults = [[0, 4], [6, 5], [11, 6], [16, 7], [21, 8]];

  iconData = {
    name: 'fireflake',
    color: '#f50',
    tooltipDesc: 'Being purified by holy light.'
  };

  cast(caster: Character, target: Character, skillRef?: Skill) {
    this.setPotencyAndGainSkill(caster, skillRef);

    const damage = +dice.roll(`${this.getTotalDamageRolls(caster)}d${this.getTotalDamageDieSize(caster)}`);

    let isCrit = false;
    let damageMultiplier = 1;

    const holyAfflictionChance = caster.getTraitLevelAndUsageModifier('HolyAffliction');
    if(RollerHelper.XInOneHundred(holyAfflictionChance)) {
      isCrit = true;
      damageMultiplier += caster.getTraitLevel('HolyAffliction') * 0.5;
    }

    this.magicalAttack(caster, target, {
      skillRef,
      atkMsg: `You ${isCrit ? 'critically ' : ' '}scorch ${target.name}!`,
      defMsg: `${this.getCasterName(caster, target)} ${isCrit ? 'critically ' : ' '}scorched you with holy fire!`,
      damage: Math.floor(damage * damageMultiplier),
      damageClass: 'fire'
    });

    if(caster.getTraitLevel('HolyIllumination')) {
      const light = new Light({ radius: 0 });
      light.cast(caster, target);
    }

    if(caster.getTraitLevel('SearingPurification') && !target.hasEffect('RecentlyPurified')) {
      this.effectInfo = { damage, caster: caster.uuid };
      this.duration = 5;
      this.flagCasterName(caster.name);
      target.applyEffect(this);
    }
  }

  effectStart(char: Character) {
    this.effectMessage(char, 'A searing pain courses through your body!');
  }

  effectTick(char: Character) {
    const caster = char.$$room.state.findPlayer(this.effectInfo.caster);

    char.mp.sub(Math.floor(char.mp.maximum * 0.02));

    CombatHelper.magicalAttack(caster, char, {
      effect: this,
      atkMsg: `${char.name} is getting seared alive!`,
      defMsg: `You are getting seared alive!`,
      damage: this.effectInfo.damage,
      damageClass: 'fire',
      isOverTime: true
    });

  }

  effectEnd(char: Character) {
    this.effectMessage(char, 'Your body is no longer searing on the inside.');

    const recently = new RecentlyPurified({});
    recently.cast(char, char);
  }
}
