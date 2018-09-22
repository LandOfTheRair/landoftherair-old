
import { clamp } from 'lodash';

import { SpellEffect } from '../../base/Effect';
import { Character, StatName } from '../../../shared/models/character';
import { Skill } from '../../base/Skill';
import { RollerHelper } from '../../../shared/helpers/roller-helper';

export class RecentlySnared extends SpellEffect {

  iconData = {
    name: 'light-thorny-triskelion',
    color: '#000',
    tooltipDesc: 'Recently snared and cannot be snared for a period.'
  };

  cast(caster: Character, target: Character, skillRef?: Skill) {
    this.duration = 10;
    target.applyEffect(this);
  }
}

export class Snare extends SpellEffect {

  iconData = {
    name: 'light-thorny-triskelion',
    color: '#0a0',
    tooltipDesc: 'Snared and slowed.'
  };

  maxSkillForSkillGain = 15;

  private movementLoss = 1;

  cast(caster: Character, target: Character, skillRef?: Skill) {
    this.setPotencyAndGainSkill(caster, skillRef);
    this.flagCasterName(caster.name);

    if(target.hasEffect('RecentlySnared') || target.hasEffect('Snare')) {
      return this.effectMessage(caster, `${target.name} resisted your snare!`);
    }

    target.addAgro(caster, 30);

    const userStat = caster.baseClass === 'Healer' ? 'wis' : 'int';
    const resistStat = 'wil';

    const baseStat = caster.getTotalStat(<StatName>userStat);
    const targetStat = target.getTotalStat(<StatName>resistStat);

    const successChance = clamp((baseStat - targetStat) + 2, 0, 4) * 25;

    if(!RollerHelper.XInOneHundred(successChance)) {
      caster.sendClientMessage(`${target.name} resisted your snare!`);
      return;
    }

    if(caster.getTraitLevel('StrongerSnare')) {
      this.movementLoss += 1;
    }

    this.duration = clamp((this.potency + baseStat) - targetStat, 3, 5);
    this.duration += caster.getTraitLevel('NatureSpirit');

    target.applyEffect(this);
  }

  effectStart(char: Character) {
    this.effectMessage(char, 'Roots grow from the ground to slow your movement!');
    this.loseStat(char, 'move', this.movementLoss);
  }

  effectEnd(char: Character) {
    const recentlySnared = new RecentlySnared({});
    recentlySnared.cast(char, char);
    this.effectMessage(char, 'The roots disappear.');
  }
}
