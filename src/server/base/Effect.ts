
import { Character } from '../../models/character';
import { extend } from 'lodash';

export const Maxes = {
  Lesser: 10,
  Minor: 15
};

export class Effect {

  name = '';
  iconData = {};
  _baseDuration = 0;
  duration = 0;
  potency = 0;
  stats = {};

  constructor(opts) {
    extend(this, opts);

    if(!this._baseDuration) {
      this._baseDuration = this.duration;
    }
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
