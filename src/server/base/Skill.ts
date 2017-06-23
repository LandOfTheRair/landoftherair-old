
import { Character } from '../../models/character';
import { Command } from './Command';

export abstract class Skill extends Command {

  mpCost = 0;
  hpCost = 0;
  range = 0;

  canUse(user: Character, target: Character): boolean {
    if(user.mp.lessThan(this.mpCost)) return false;
    if(user.hp.lessThan(this.hpCost)) return false;
    if(user.distFrom(target) > this.range) return false;
    return true;
  }

}
