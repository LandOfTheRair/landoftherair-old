
import { SpellEffect } from '../../base/Effect';
import { Character } from '../../../shared/models/character';
import { Skill } from '../../base/Skill';
import { RecentlyShattered } from '../recents/RecentlyShattered';
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
    char.sendClientMessageToRadius(`${char.name} pinpoints the hidden attackers!`);

    const revealed = char.$$room.state.getPlayersInRange(char, 4, [], false);
    revealed.forEach(target => {
      const revealEffect = new Revealed({});
      revealEffect.duration = 3;
      revealEffect.cast(char, target);
    });

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
