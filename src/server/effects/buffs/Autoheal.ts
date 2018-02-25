
import { SpellEffect } from '../../base/Effect';
import { Character, SkillClassNames } from '../../../shared/models/character';
import { CombatHelper } from '../../helpers/combat-helper';
import { Skill } from '../../base/Skill';

export class Autoheal extends SpellEffect {

  iconData = {
    name: 'self-love',
    color: '#00a',
    tooltipDesc: 'Restores health when it goes lower than the threshold.'
  };

  maxSkillForSkillGain = 15;
  skillFlag = (caster) => SkillClassNames.Restoration;

  cast(caster: Character, target: Character, skillRef?: Skill) {

    this.setPotencyAndGainSkill(caster, skillRef);

    if(caster !== target) {
      this.effectMessage(caster, `You cast autoheal on ${target.name}!`);
    }

    const wisCheck = this.getCoreStat(caster);

    this.duration = this.duration || wisCheck * caster.calcSkillLevel(SkillClassNames.Restoration);
    this.potency = 30;

    this.effectInfo = { damage: 0, caster: caster.uuid };
    target.applyEffect(this);
  }

  effectStart(char: Character) {
    this.effectMessage(char, 'Your chest feels unnaturally warmer!');
    this.iconData.tooltipDesc = `Restores health when it goes lower than ${this.potency}%`;
  }

  effectTick(char: Character) {
    if(char.hp.gtePercent(this.potency)) return;

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
