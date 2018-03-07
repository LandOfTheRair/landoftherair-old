
import { SpellEffect } from '../../base/Effect';
import { Character } from '../../../shared/models/character';
import { Skill } from '../../base/Skill';
import { RecentlyShattered } from '../recents/RecentlyShattered';

export class DefensesShattered extends SpellEffect {

  iconData = {
    name: 'on-sight',
    color: '#333',
    tooltipDesc: '-33% CON/WIL.'
  };

  private secondaryPotency: number;

  cast(caster: Character, target: Character, skillRef?: Skill) {
    this.effectInfo = { damage: 0, caster: '' };
    this.potency = Math.floor(target.getTotalStat('con') / 3);
    this.secondaryPotency = Math.floor(target.getTotalStat('wil') / 3);
    target.applyEffect(this);
  }

  effectStart(char: Character) {
    this.effectMessage(char, 'Your defenses have been shattered!');
    char.loseStat('con', this.potency);
    char.loseStat('wil', this.secondaryPotency);
  }

  effectEnd(char: Character) {
    char.gainStat('con', this.potency);
    char.gainStat('wil', this.secondaryPotency);
    const recently = new RecentlyShattered({});
    recently.cast(char, char);
    this.effectMessage(char, 'Your defenses have recovered.');
  }
}
