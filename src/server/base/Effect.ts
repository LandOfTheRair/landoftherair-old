
import { Character } from '../../models/character';
import { extend } from 'lodash';
import { Skill } from './Skill';

export const Maxes = {
  Lesser: 10,
  Minor: 15
};

class EffectInfo {
  damage?: number;
  caster: string;
}

export class Effect {

  name = '';
  iconData = {};
  duration = 0;
  potency = 0;
  stats = {};

  effectInfo: EffectInfo = { caster: '' };

  constructor(opts) {
    extend(this, opts);
    if(!this.name) this.name = this.constructor.name;
  }

  tick(char: Character) {
    this.effectTick(char);

    this.duration--;
    if(this.duration <= 0) {
      char.unapplyEffect(this);
      this.effectEnd(char);
    }
  }

  effectTick(char: Character) {}
  effectStart(char: Character) {}
  effectEnd(char: Character) {}

  effectMessage(char: Character, message: string) {
    if(!char) return;
    char.sendClientMessage(message);
  }
}

export class SpellEffect extends Effect {
  flagSkills = [];

  cast(caster: Character, target: Character, skillRef: Skill) {}
}
