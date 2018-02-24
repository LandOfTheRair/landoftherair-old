
import { Player } from '../../shared/models/player';
import { SkillClassNames } from '../../shared/models/character';
import { capitalize } from 'lodash';

export class MetalworkingHelper {

  static canMetalwork(player: Player): boolean {
    return player.baseClass === 'Warrior';
  }

  static chooseIngotType(type: string): string {
    switch(type) {
      case 'Copper': return 'Pillars';
      case 'Silver': return 'Hourglass';
      case 'Gold':   return 'Infinity';
    }
  }

  static async createIngotFor(player: Player, type: string): Promise<void> {
    type = capitalize(type);
    const brick = await player.$$room.itemCreator.getItemByName(`${type} Ingot (${this.chooseIngotType(type)})`);
    player.tradeSkillContainers.metalworking.craftResult = brick;

    if(player.calcSkillLevel(SkillClassNames.Metalworking) < 5) {
      player.gainSkill(SkillClassNames.Metalworking, 1);
    }
  }

  static successPercent(player: Player): number {
    return 0;
  }

}
