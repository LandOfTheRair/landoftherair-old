
import { startCase } from 'lodash';

import { Player } from './player';

export class Trait {

  static baseClass: string;
  static increaseLevel: boolean = true;
  static traitName: string = 'Name';
  static description: string = 'Description';
  static icon: string = '';

  static tpCost: number = 100;
  static maxLevel: number = 0;

  static currentLevel(player: Player): number {
    return player.getTraitLevel(this.traitName);
  }

  static canBuy(player: Player): boolean {
    if(this.baseClass && player.baseClass !== this.baseClass) return false;
    return player.getTraitLevel(this.traitName) < this.maxLevel && player.hasTraitPoints(this.tpCost);
  }

  static buy(player: Player): void {
    player.loseTraitPoints(this.tpCost);
    if(this.increaseLevel) player.increaseTraitLevel(this.traitName);
    player.sendClientMessage(`Your personality has expanded with knowledge of "${startCase(this.traitName)}"!`);
    player.recalculateStats();
  }
}
