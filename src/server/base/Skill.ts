
import { Character } from '../../models/character';
import { Command } from './Command';

import { isFunction } from 'lodash';

export abstract class Skill extends Command {

  mpCost = (caster?: Character) => 0;
  hpCost = (caster?: Character) => 0;
  range = (caster?: Character) => 0;

  canUse(user: Character, target: Character): boolean {
    if(user.mp.lessThan(this.mpCost(user))) return false;
    if(user.hp.lessThan(this.hpCost(user))) return false;
    if(user.distFrom(target) > this.range(user)) return false;
    return true;
  }

}
