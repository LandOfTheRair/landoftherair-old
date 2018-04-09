
import { startCase } from 'lodash';

import { Player } from './player';

export class Trait {

  static baseClass: string;
  static increaseLevel = true;
  static traitName = 'Name';
  static description = 'Description';
  static icon = '';

  static tpCost = 100;
  static maxLevel = 0;

  static currentLevel(player: Player): number {
    return player.getBaseTraitLevel(this.traitName);
  }

  static canBuy(player: Player): boolean {
    if(this.baseClass && player.baseClass !== this.baseClass) return false;
    return player.getBaseTraitLevel(this.traitName) < this.maxLevel; // && player.hasTraitPoints(this.tpCost);
  }

  static buy(player: Player, extra?): void {
    // player.loseTraitPoints(this.tpCost);
    if(this.increaseLevel) player.increaseTraitLevel(this.traitName, 1, this.baseClass, extra);
    player.sendClientMessage(`Your personality has expanded with knowledge of "${startCase(this.traitName)}"!`);
    player.recalculateStats();
  }

  static currentlyInEffect(player: Player): boolean {
    return !this.baseClass || player.baseClass === this.baseClass;
  }
}
