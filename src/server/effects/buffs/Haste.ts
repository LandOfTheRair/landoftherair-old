
import { sample } from 'lodash';

import { SpellEffect } from '../../base/Effect';
import { Character, StatName } from '../../../shared/models/character';
import { Skill } from '../../base/Skill';
import { RecentlyHasted } from '../recents/RecentlyHasted';

export class Haste extends SpellEffect {

  iconData = {
    name: 'time-trap',
    color: '#0a0',
    tooltipDesc: 'Use one extra action per round.'
  };

  maxSkillForSkillGain = 25;

  cast(caster: Character, target: Character, skillRef?: Skill) {
    this.setPotencyAndGainSkill(caster, skillRef);
    this.flagUnapply();
    this.flagCasterName(caster.name);

    if(!this.duration) this.duration = 45 * this.potency;
    this.updateDurationBasedOnTraits(caster);

    if(caster !== target) {
      this.casterEffectMessage(caster, `You cast Haste on ${target.name}.`);
    }

    const recentlyHasted = target.hasEffect('RecentlyHasted');
    if(recentlyHasted) {
      target.unapplyEffect(recentlyHasted, true);
      target.sendClientMessage('You feel a wrenching sensation.');
      const lostStat = sample(['str', 'dex', 'agi', 'con']);
      target.loseBaseStat(<StatName>lostStat, -1);
    }

    target.applyEffect(this);
  }

  effectStart(char: Character) {
    this.targetEffectMessage(char, 'The world around you appears to slow down.');
    char.gainStat('actionSpeed', 1);
  }

  effectEnd(char: Character) {
    this.effectMessage(char, 'Your perception of the world speeds up.');
    char.loseStat('actionSpeed', 1);

    if(this.duration <= 0) {
      const recentlyHasted = new RecentlyHasted({});
      recentlyHasted.cast(char, char);
    }
  }
}
