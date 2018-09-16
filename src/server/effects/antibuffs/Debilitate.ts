
import { SpellEffect } from '../../base/Effect';
import { Character } from '../../../shared/models/character';
import { Skill } from '../../base/Skill';

export class Debilitate extends SpellEffect {

  iconData = {
    name: 'one-eyed',
    color: '#f00',
    tooltipDesc: 'All hidden attacks against this target are counted as backstabs.'
  };

  maxSkillForSkillGain = 16;

  private recentlyDurationLoss: number;

  cast(caster: Character, target: Character, skillRef?: Skill) {
    this.setPotencyAndGainSkill(caster, skillRef);
    this.flagCasterName(caster.name);

    this.duration = 10;

    if(target.hasEffect('RecentlyDebilitated') || target.hasEffect('Debilitate')) {
      return this.effectMessage(caster, `${target.name} resisted your debilitation!`);
    }

    this.recentlyDurationLoss = caster.getTraitLevelAndUsageModifier('RecuperatingDebilitation');
    target.addAgro(caster, 30);
    target.applyEffect(this);
  }

  effectStart(char: Character) {
    this.effectMessage(char, 'You feel like you see daggers in every corner of your vision!');
  }

  effectEnd(char: Character) {
    const recentlyDebilitated = new RecentlyDebilitated({ duration: Math.max(10, 60 - this.recentlyDurationLoss) });
    recentlyDebilitated.cast(char, char);
    this.effectMessage(char, 'Your perception of the hidden is heightened!');
  }
}

export class RecentlyDebilitated extends SpellEffect {

  iconData = {
    name: 'one-eyed',
    color: '#000',
    tooltipDesc: 'Recently debilitated. +10% perception.'
  };

  cast(caster: Character, target: Character, skillRef?: Skill) {
    this.duration = this.duration || 60;
    this.potency = Math.floor(target.getTotalStat('perception') / 10);
    target.applyEffect(this);
  }

  effectStart(char: Character) {
    this.gainStat(char, 'perception', this.potency);
  }
}