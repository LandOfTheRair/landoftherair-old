
import { Command } from '../../../base/Command';
import { Player } from '../../../../shared/models/player';
import { ItemCreator } from '../../../helpers/item-creator';

export class GMSearchItems extends Command {

  public name = '@searchitems';
  public format = 'ItemName';

  async execute(player: Player, { room, gameState, args }) {
    if(!player.isGM) return;

    const itemName = args;
    if(!itemName) return false;

    let items;
    try {
      items = await ItemCreator.searchItems(itemName);
    } catch(e) {
      return;
    }

    if(!items.length) return player.sendClientMessage(`No items matching "${itemName}" were found.`);

    player.sendClientMessage(`Search results for item with name "${itemName}":`);
    for(let i = 0; i < items.length; i++) {
      if(i >= 5) {
        player.sendClientMessage(`... and ${items.length - 5} more.`);
        return;
      }
      player.sendClientMessage(`${i + 1}: ${items[i].name}`);
    }
  }
}
