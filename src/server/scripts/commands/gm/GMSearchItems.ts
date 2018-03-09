
import { Command } from '../../../base/Command';
import { Player } from '../../../../shared/models/player';
import { SubscriptionHelper } from '../../../helpers/subscription-helper';

export class GMSearchItems extends Command {

  public name = '@searchitems';
  public format = 'ItemName';

  async execute(player: Player, { args }) {
    if(!SubscriptionHelper.isGM(player)) return;

    let itemName = '';
    let limit = 5;

    const [gotLimit, gotItem] = args.split(' ');

    if(!gotItem) {
      itemName = gotLimit;
    } else {
      limit = +gotLimit;
      itemName = args.substring(args.indexOf(' ') + 1);
    }

    if(!itemName) return false;

    let items;
    try {
      items = await player.$$room.itemCreator.searchItems(itemName);
    } catch(e) {
      return;
    }

    if(!items.length) return player.sendClientMessage(`No items matching "${itemName}" were found.`);

    player.sendClientMessage(`Search results for item with name "${itemName}":`);
    for(let i = 0; i < items.length; i++) {
      if(i >= limit) {
        player.sendClientMessage(`... and ${items.length - limit} more.`);
        return;
      }
      player.sendClientMessage(`${i + 1}: ${items[i].name}`);
    }
  }
}
