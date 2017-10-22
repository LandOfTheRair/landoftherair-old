
import { SpellEffect } from '../base/Effect';
import { Character, SkillClassNames } from '../../shared/models/character';
import { Skill } from '../base/Skill';
import { RecentlyStunned } from './RecentlyStunned';

export class Stunned extends SpellEffect {

  iconData = {
    name: 'knockout',
    color: '#990',
    tooltipDesc: 'Stunned and unable to act.'
  };

  maxSkillForSkillGain = 9;
  skillFlag = () => SkillClassNames.Restoration;

  cast(caster: Character, target: Character, skillRef?: Skill) {
    this.setPotencyAndGainSkill(caster, skillRef);

    if(target.hasEffect('RecentlyStunned')) {
      return this.effectMessage(caster, `${target.name} resisted your stun!`);
    }

    // physical attack
    if(!skillRef) {
      this.duration = 3;

    // cast via spell
    } else {
      const targetWil = target.getTotalStat('wil');
      if(targetWil > this.potency) return this.effectMessage(caster, `${target.name} resisted your stun!`);

      this.duration = Math.max(7, this.potency - targetWil);
    }

    target.applyEffect(this);
  }

  effectStart(char: Character) {
    this.effectMessage(char, 'You are stunned!');
  }

  effectEnd(char: Character) {
    const recentlyStunned = new RecentlyStunned({});
    recentlyStunned.cast(char, char);
    this.effectMessage(char, 'You are no longer stunned.');
  }
}
