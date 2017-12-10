
import { startCase } from 'lodash';

import { Player } from './player';
import { Trait } from './trait';

export class PartyTrait extends Trait {

  static baseClass: string;
  static increaseLevel = true;
  static traitName = 'Name';
  static description = 'Description';
  static icon = '';

  static tpCost = 100;
  static maxLevel = 0;

  static currentLevel(player: Player): number {
    return player.getTraitLevel(this.traitName);
  }

  static canBuy(player: Player): boolean {
    return player.getTraitLevel(this.traitName) < this.maxLevel && player.hasPartyPoints(this.tpCost);
  }

  static buy(player: Player, extra): void {
    player.losePartyPoints(this.tpCost);
    if(this.increaseLevel) player.increaseTraitLevel(this.traitName, this.baseClass, extra);
    player.sendClientMessage(`Your party knowledge has expanded in the form of "${startCase(this.traitName)}"!`);
    player.recalculateStats();
  }
}
