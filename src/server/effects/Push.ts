
import { SpellEffect } from '../base/Effect';
import { Character, SkillClassNames } from '../../shared/models/character';
import { Skill } from '../base/Skill';
import { random, clamp } from 'lodash';

export class Push extends SpellEffect {

  maxSkillForSkillGain = 15;
  skillFlag = (caster) => {
    if(caster.baseClass === 'Healer') return SkillClassNames.Restoration;
      return SkillClassNames.Conjuration;
  }

  cast(caster: Character, target: Character, skillRef?: Skill) {
    if((<any>target).hostility === 'Never') return caster.sendClientMessage('How rude.');

    target.addAgro(caster, 5);

    const predetermined = this.potency;

    const userStat = caster.baseClass === 'Healer' ? 'wis' : 'int';
    const resistStat = this.potency ? 'con' : 'wil';

    if(!predetermined) {
      this.setPotencyAndGainSkill(caster, skillRef);
    }

    const baseStat = caster.getTotalStat(userStat);
    const targetStat = target.getTotalStat(resistStat);

    const successChance = clamp(baseStat - targetStat + 4, 0, 8) * 12.5;

    if(random(0, 100) < successChance) {
      if(!predetermined) caster.sendClientMessage(`${target.name} resisted your push!`);
      return;
    }

    target.sendClientMessageToRadius(`${target.name} was knocked down!`, 5);
    target.takeSequenceOfSteps([{ x: random(-1, 1), y: random(-1, 1) }], false, true);
  }
}
