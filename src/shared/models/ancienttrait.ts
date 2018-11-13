
import { startCase } from 'lodash';

import { Player } from './player';
import { Trait } from './trait';

export class AncientTrait extends Trait {

  static baseClass: string;
  static traitName = 'Name';
  static description = 'Description';
  static icon = '';

  static canBuy(player: Player, cost: number): boolean {
    return player.skillTree.hasAncientPoints(cost);
  }

  static buy(player: Player, cost: number, extra): void {
    player.skillTree.loseAncientPoints(cost);
    player.increaseTraitLevel(this.traitName, 1, this.baseClass, extra);
    player.sendClientMessage(`Your ancient knowledge has expanded in the form of "${startCase(this.traitName)}"!`);
    player.recalculateStats();
  }
}
