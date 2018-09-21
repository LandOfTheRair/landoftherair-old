
import { sample } from 'lodash';

import { SpellEffect } from '../../base/Effect';
import { Character, StatName } from '../../../shared/models/character';
import { Skill } from '../../base/Skill';

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

    this.aoeAgro(caster, 100);

    const recentlyHasted = target.hasEffect('RecentlyHasted');
    if(recentlyHasted && target.isPlayer()) {
      target.unapplyEffect(recentlyHasted, true);
      target.sendClientMessage('You feel a wrenching sensation.');
      const lostStat = sample(['str', 'dex', 'agi', 'con']);
      target.loseBaseStat(<StatName>lostStat, 1);
    }

    target.applyEffect(this);
  }

  effectStart(char: Character) {
    this.targetEffectMessage(char, 'The world around you appears to slow down.');
    this.gainStat(char, 'actionSpeed', 1);
  }

  effectEnd(char: Character) {
    this.effectMessage(char, 'Your perception of the world speeds up.');

    if(this.duration <= 0 && !this.autocast) {
      const recentlyHasted = new RecentlyHasted({});
      recentlyHasted.cast(char, char);
    }
  }
}

export class RecentlyHasted extends SpellEffect {

  iconData = {
    name: 'time-trap',
    color: '#000',
    tooltipDesc: 'Recently hasted. Actions are 33% slower. Hasting during this period will lower one physical stat.'
  };

  private ticks: number;

  cast(caster: Character, target: Character, skillRef?: Skill) {
    this.duration = 60;
    this.ticks = 0;
    target.applyEffect(this);
  }

  effectTick(char: Character) {
    this.ticks++;
    this.effectInfo.isFrozen = this.ticks % 3 === 0;
  }
}
