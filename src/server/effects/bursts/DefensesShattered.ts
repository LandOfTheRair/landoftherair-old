
import { SpellEffect } from '../../base/Effect';
import { Character } from '../../../shared/models/character';
import { Skill } from '../../base/Skill';
import { Revealed } from '../misc/Revealed';

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
    this.effectMessageRadius(char, `${char.name} pinpoints the hidden attackers!`);

    const revealed = char.$$room.state.getPlayersInRange(char, 4, [], false);
    revealed.forEach(target => {
      const revealEffect = new Revealed({});
      revealEffect.duration = 3;
      revealEffect.cast(char, target);
    });

    this.effectMessage(char, 'Your defenses have been shattered!');
    this.loseStat(char, 'con', this.potency);
    this.loseStat(char, 'wil', this.secondaryPotency);
  }

  effectEnd(char: Character) {
    const recently = new RecentlyShattered({});
    recently.cast(char, char);
    this.effectMessage(char, 'Your defenses have recovered.');
  }
}

export class RecentlyShattered extends SpellEffect {

  iconData = {
    name: 'on-sight',
    color: '#333',
    tooltipDesc: 'Recently had shattered defenses and cannot be shattered for a period.'
  };

  cast(caster: Character, target: Character, skillRef?: Skill) {
    this.duration = 60;
    target.applyEffect(this);
  }
}