
import { clamp, random } from 'lodash';

import { SpellEffect } from '../../base/Effect';
import { Character, StatName } from '../../../shared/models/character';
import { Skill } from '../../base/Skill';
import { RecentlyBlinded } from '../recents/RecentlyBlinded';

export class Blind extends SpellEffect {

  iconData = {
    name: 'evil-eyes',
    color: '#900',
    tooltipDesc: 'Blinded and cannot see.'
  };

  maxSkillForSkillGain = 9;

  cast(caster: Character, target: Character, skillRef?: Skill) {
    this.setPotencyAndGainSkill(caster, skillRef);
    this.flagCasterName(caster.name);

    if(target.hasEffect('RecentlyBlinded') || target.hasEffect('Blind')) {
      return this.effectMessage(caster, `${target.name} resisted your blind!`);
    }

    target.addAgro(caster, 30);

    const userStat = caster.baseClass === 'Healer' ? 'wis' : 'int';
    const resistStat = 'wil';

    const baseStat = caster.getTotalStat(<StatName>userStat);
    const targetStat = target.getTotalStat(<StatName>resistStat);

    const successChance = clamp((baseStat - targetStat) + 4, 0, 8) * 12.5;

    if(random(0, 100) > successChance) {
      caster.sendClientMessage(`${target.name} resisted your blind!`);
      return;
    }

    this.duration = clamp((this.potency + baseStat) - targetStat, 2, 5);
    this.duration += caster.getTraitLevelAndUsageModifier('NatureSpirit');
    target.applyEffect(this);
  }

  effectStart(char: Character) {
    this.effectMessage(char, 'You can no longer see!');

    char.$$room.state.calculateFOV(char);
    if(char.isPlayer()) {
      char.$$room.updateFOV(char);
    }
  }

  effectEnd(char: Character) {
    const recentlyBlinded = new RecentlyBlinded({});
    recentlyBlinded.cast(char, char);
    this.effectMessage(char, 'Your vision returns.');

    char.$$room.state.calculateFOV(char);
    if(char.isPlayer()) {
      char.$$room.updateFOV(char);
    }
  }
}
