
import { Character } from '../../models/character';
import { extend } from 'lodash';

export const Maxes = {
  Lesser: 10,
  Minor: 15
};

export class Effect {

  name = '';
  iconData = {};
  duration = 0;
  potency = 0;
  stats = {};

  constructor(opts) {
    extend(this, opts);
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
    char.sendClientMessage(message);
  }
}
