
import { Command } from '../../../base/Command';
import { Player } from '../../../../shared/models/player';
import { ItemCreator } from '../../../helpers/item-creator';

export class GMCreateGold extends Command {

  public name = '@gold';
  public format = 'Value';

  async execute(player: Player, { room, gameState, args }) {
    if(!player.isGM) return;

    const value = +args;
    if(!value) return false;

    const item = await ItemCreator.getGold(value);

    room.addItemToGround(player, item);
  }
}
