
import { SpellEffect } from '../../base/Effect';
import { Character } from '../../../shared/models/character';
import { Skill } from '../../base/Skill';

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
