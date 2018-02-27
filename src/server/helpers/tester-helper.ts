
import { Player } from '../../shared/models/player';

const level1 = {

};

const Loadouts = {
  Mage: {
    1: {}
  },
  Thief: {
    1: {}
  },
  Warrior: {
    1: {}
  },
  Healer: {
    1: {}
  }
};

export class TesterHelper {

  static generateLoadout(player: Player, level: number) {
    // find closest level gear (while(level--))
    // generate gear
    // give one of every main weapon at a level
  }

  static setLevel(player: Player, level: number) {
    // set level
  }

  static setSkill(player: Player, skill: number) {

  }

  static genPotion(player: Player) {

  }

  static resetTraits(player: Player) {
    // 1000 trait points
    // reset traits
  }

}
