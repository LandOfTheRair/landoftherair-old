
import { SpellEffect } from '../base/Effect';
import { Character, SkillClassNames } from '../../shared/models/character';
import { CombatHelper } from '../helpers/combat-helper';
import { Skill } from '../base/Skill';
import * as dice from 'dice.js';

export class Autoheal extends SpellEffect {

  iconData = {
    name: 'self-love',
    color: '#00a',
    tooltipDesc: 'Constantly restoring health.'
  };

  maxSkillForSkillGain = 15;
  skillFlag = (caster) => SkillClassNames.Restoration;

  cast(caster: Character, target: Character, skillRef?: Skill) {

    this.setPotencyAndGainSkill(caster, skillRef);

    if(caster !== target) {
      this.effectMessage(caster, `You cast autoheal on ${target.name}!`);
    }

    let mult = 0.25;
    if(this.potency > 0)  mult = 0.5;
    if(this.potency > 11) mult = 1;
    if(this.potency > 21) mult = 2;

    const wisCheck = Math.floor(mult * this.getCasterStat(caster, 'wis'));

    this.duration = this.duration || mult * wisCheck * caster.calcSkillLevel(SkillClassNames.Restoration);

    this.effectInfo = { damage: 0, caster: caster.uuid };
    target.applyEffect(this);
  }

  effectStart(char: Character) {
    this.effectMessage(char, 'Your chest feels unnaturally warmer!');
  }

  effectTick(char: Character) {
    if(char.hp.gtePercent(30)) return;

    const healAmt = -char.hp.maximum;

    const caster = char.$$room.state.findPlayer(this.effectInfo.caster);

    char.sendClientMessage('A warm surge of energy runs through your chest!');

    this.duration = Math.max(1, this.duration - 50);

    CombatHelper.magicalAttack(caster, char, {
      effect: this,
      damage: healAmt,
      damageClass: 'heal'
    });

  }

  effectEnd(char: Character) {
    this.effectMessage(char, 'The unnatural warmth in your chest fades.');
  }
}
