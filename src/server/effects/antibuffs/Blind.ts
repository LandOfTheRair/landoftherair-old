
import { clamp } from 'lodash';

import { SpellEffect } from '../../base/Effect';
import { Character, StatName } from '../../../shared/models/character';
import { Skill } from '../../base/Skill';
import { RollerHelper } from '../../../shared/helpers/roller-helper';

export class RecentlyBlinded extends SpellEffect {

  iconData = {
    name: 'evil-eyes',
    color: '#000',
    tooltipDesc: 'Recently blinded and cannot be blinded for a period.'
  };

  cast(caster: Character, target: Character, skillRef?: Skill) {
    this.duration = 10;
    target.applyEffect(this);
  }
}

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

    if(!RollerHelper.XInOneHundred(successChance)) {
      caster.sendClientMessage(`${target.name} resisted your blind!`);
      return;
    }

    caster.sendClientMessage({ message: `You blinded ${target.name}!`, sfx: 'spell-debuff-give' });

    this.duration = clamp((this.potency + baseStat) - targetStat, 2, 5);
    this.duration += caster.getTraitLevel('NatureSpirit');
    target.applyEffect(this);
  }

  effectStart(char: Character) {
    this.effectMessage(char, { message: 'You can no longer see!', sfx: 'spell-debuff-receive' });

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
