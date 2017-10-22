
import { SpellEffect } from '../base/Effect';
import { Character, SkillClassNames } from '../../shared/models/character';
import { Skill } from '../base/Skill';

export class LowCON extends SpellEffect {

  iconData = {
    name: 'glass-heart',
    color: '#f00',
    tooltipDesc: 'Your base CON is dangerously low - drink a CON pot or risk getting stripped and losing permanent health.'
  };

  cast(caster: Character, target: Character, skillRef?: Skill) {

    this.duration = -1;
    this.effectInfo = { isPermanent: true, caster: caster.uuid };
    caster.applyEffect(this);
  }

  effectStart(char: Character) {
    this.effectMessage(char, 'Your constitution is dangerously low!');
  }

  effectTick(char: Character) {
    if(char.getBaseStat('con') <= 3) return;

    this.effectEnd(char);
    char.unapplyEffect(this);
  }

  effectEnd(char: Character) {
    this.effectMessage(char, 'You are no longer in danger of losing health or getting stripped.');
  }
}
