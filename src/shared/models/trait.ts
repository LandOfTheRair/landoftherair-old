
import { startCase } from 'lodash';

import { Player } from './player';
import { Character } from './character';

interface TraitUpgrade {
  cost?: number;
  capstone?: boolean;
  unbuyable?: boolean;
  requireCharacterLevel?: number;
  requireSkillLevel?: number;
}

export class Trait {

  static baseClass: string;
  static traitName = 'Name';
  static description = 'Description';
  static icon = '';
  static isFree: boolean;
  static isAncient: boolean;

  static upgrades: TraitUpgrade[] = [];

  static determineUpgradeCost(traitRef: any, upgrade: TraitUpgrade): number {
    if(upgrade.cost)      return upgrade.cost;

    if(traitRef.isAncient) {
      if(upgrade.capstone) return 3;
      return 1;
    }

    if(upgrade.capstone)  return 10;
    return 3;
  }

  static canBuy(player: Player, cost: number): boolean {
    if(this.baseClass && player.baseClass !== this.baseClass) return false;
    return player.skillTree.hasTraitPoints(cost);
  }

  static buy(player: Player, cost: number, extra?): void {
    player.skillTree.loseTraitPoints(cost);
    player.increaseTraitLevel(this.traitName, 1, this.baseClass, extra);
    player.sendClientMessage(`Your personality has expanded with knowledge of "${startCase(this.traitName)}"!`);
    player.recalculateStats();
  }

  static currentlyInEffect(player: Player): boolean {
    return !this.baseClass || player.baseClass === this.baseClass;
  }

  static usageModifier(level: number, character?: Character): number {
    return level;
  }
}

export class FreeTrait extends Trait {

  static isFree = true;

  static determineUpgradeCost(): number {
    return 0;
  }

  static canBuy(): boolean {
    return false;
  }

  static buy(): void {
    return;
  }
}
