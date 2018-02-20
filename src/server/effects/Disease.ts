
import { SpellEffect } from '../base/Effect';
import { Character, SkillClassNames } from '../../shared/models/character';
import { CombatHelper } from '../helpers/combat-helper';
import { Skill } from '../base/Skill';
import * as dice from 'dice.js';

export class Disease extends SpellEffect {

  iconData = {
    name: 'death-juice',
    color: '#0a0',
    tooltipDesc: 'Constantly receiving necrotic damage.'
  };

  maxSkillForSkillGain = 13;
  skillMults = [[0, 2], [11, 3], [21, 4]];
  skillFlag = (caster) => {
    if(caster.baseClass === 'Healer')   return SkillClassNames.Restoration;
    return SkillClassNames.Thievery;
  }

  cast(caster: Character, target: Character, skillRef?: Skill) {

    this.setPotencyAndGainSkill(caster, skillRef);

    let mult = this.getMultiplier();

    if(caster.baseClass === 'Thief') mult = Math.floor(mult * 1.5);

    const calcMod = Math.max(1, this.getCasterStat(caster, 'wis') - target.getTotalStat('con'));

    const wisCheck = Math.max(1, Math.floor(mult * calcMod));
    const totalPotency = this.getTotalDamageRolls(caster);
    const damage = +dice.roll(`${totalPotency}d${wisCheck}`);

    this.duration = this.duration || +dice.roll(`${totalPotency}d4`);

    this.effectInfo = { damage, caster: caster.uuid };
    target.applyEffect(this);
    this.effectMessage(caster, `You diseased ${target.name}!`);
  }

  effectStart(char: Character) {
    this.effectMessage(char, 'You were diseased!');
  }

  effectTick(char: Character) {
    const caster = char.$$room.state.findPlayer(this.effectInfo.caster);

    CombatHelper.magicalAttack(caster, char, {
      effect: this,
      defMsg: `You are diseased!`,
      damage: this.effectInfo.damage,
      damageClass: 'necrotic'
    });

  }

  effectEnd(char: Character) {
    this.effectMessage(char, 'Your body recovered from the disease.');
  }
}
