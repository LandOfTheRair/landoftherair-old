
import { Character } from '../../models/character';
import { Command } from './Command';

import { isFunction } from 'lodash';

export abstract class Skill extends Command {

  requiresLearn = true;

  mpCost = (caster?: Character) => 0;
  hpCost = (caster?: Character) => 0;
  range = (caster?: Character) => 0;

  canUse(user: Character, target: Character): boolean {
    if(user.mp.lessThan(this.mpCost(user))) return false;
    if(user.hp.lessThan(this.hpCost(user))) return false;
    if(user.distFrom(target) > this.range(user)) return false;
    return true;
  }

  tryToConsumeMP(user: Character, effect): boolean {

    if(effect) return true;

    const mpCost = this.mpCost();

    if(user.mp.getValue() < mpCost) {
      user.sendClientMessage('You do not have enough MP!');
      return false;
    }

    if(mpCost > 0) {
      user.mp.sub(mpCost);
    }

    return true;
  }

  getTarget(user: Character, args: string, allowSelf = false): Character {

    let target = null;

    if(allowSelf) {
      target = user;
    }

    if(args) {
      const possTargets = user.$$room.getPossibleMessageTargets(user, args);
      target = possTargets[0];
    }

    if(!target) {
      user.sendClientMessage('You do not see that person.');
      return null;
    }

    const range = this.range();

    if(target.distFrom(user) > range) {
      user.sendClientMessage('That target is too far away!');
      return null;
    }

    return target;
  }

}
