
import { Command } from '../../../base/Command';
import { Player } from '../../../../shared/models/player';
import { ItemCreator } from '../../../helpers/item-creator';

export class GMCreateItem extends Command {

  public name = '@item';
  public format = 'ItemName';

  async execute(player: Player, { room, gameState, args }) {
    if(!player.isGM) return;

    const itemName = args;
    if(!itemName) return false;

    let item;
    try {
      item = await ItemCreator.getItemByName(itemName);
    } catch(e) {
      player.sendClientMessage(`Warning: item "${itemName}" does not exist.`);
      return;
    }

    room.addItemToGround(player, item);
  }
}
