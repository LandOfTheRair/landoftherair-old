
import { SpellEffect } from '../base/Effect';
import { Character, SkillClassNames } from '../../shared/models/character';
import { Skill } from '../base/Skill';
import { random } from 'lodash';

export class Push extends SpellEffect {

  maxSkillForSkillGain = 15;
  skillFlag = (caster) => {
    if(caster.baseClass === 'Healer') return SkillClassNames.Restoration;
      return SkillClassNames.Conjuration;
  }

  cast(caster: Character, target: Character, skillRef?: Skill) {
    if((<any>target).hostility === 'Never') return caster.sendClientMessage('How rude.');

    if(!this.potency) {
      this.setPotencyAndGainSkill(caster, skillRef);
    } else {
      const baseStat = caster.getTotalStat(caster.baseClass === 'Healer' ? 'wis' : 'int');
      if(baseStat < target.getTotalStat('wil')) return caster.sendClientMessage(`${target.name} resisted your push!`);
    }

    target.addAgro(caster, 5);
    target.sendClientMessageToRadius(`${target.name} was knocked down!`, 5);
    target.takeSequenceOfSteps([{ x: random(-1, 1), y: random(-1, 1) }], false, true);
  }
}
