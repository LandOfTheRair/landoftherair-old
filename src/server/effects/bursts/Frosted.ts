
import { SpellEffect } from '../../base/Effect';
import { Character } from '../../../shared/models/character';
import { Skill } from '../../base/Skill';

export class RecentlyFrosted extends SpellEffect {

  iconData = {
    name: 'cold-heart',
    color: '#000',
    tooltipDesc: 'Recently frosted and cannot be frosted for a period.'
  };

  cast(caster: Character, target: Character, skillRef?: Skill) {
    this.duration = Math.floor(10 / caster.getTraitLevelAndUsageModifier('SustainedImmunity'));
    target.applyEffect(this);
  }
}

export class Frosted extends SpellEffect {

  iconData = {
    name: 'cold-heart',
    color: '#000080',
    tooltipDesc: 'Actions are 50% slower.'
  };

  private isPermaFrosted: boolean;

  cast(caster: Character, target: Character, skillRef?: Skill) {
    this.effectInfo = { damage: 0, caster: '', isFrozen: false };
    target.applyEffect(this);
  }

  effectStart(char: Character) {
    if(this.isPermaFrosted) {
      this.iconData.tooltipDesc = 'Frozen solid!';
      this.effectMessage(char, 'The embrace of winter swallows you whole!');
      return;
    }

    this.effectMessage(char, 'A layer of frost forms on your skin!');
  }

  effectTick(char: Character) {
    if(this.isPermaFrosted) {
      this.effectInfo.isFrozen = true;
      return;
    }

    this.effectInfo.isFrozen = !this.effectInfo.isFrozen;
  }

  effectEnd(char: Character) {
    const recently = new RecentlyFrosted({});
    recently.cast(char, char);

    if(this.isPermaFrosted) {
      this.effectMessage(char, 'The embrace of winter has left you.');
      return;
    }

    this.effectMessage(char, 'The frost melts from your skin.');
  }
}
