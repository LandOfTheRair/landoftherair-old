
import { Command } from '../../../../base/Command';
import { Player } from '../../../../../shared/models/player';

export class GroundToEquip extends Command {

  public name = '~GtE';
  public format = 'ItemType ItemId';

  execute(player: Player, { room, args }) {
    const splitArgs = args.split(' ');
    if(this.isAccessingLocker(player)) return;
    if(splitArgs.length < 1) return false;

    const [itemType, itemId] = splitArgs;

    let item = null;
    if(itemId) {
      item = this.getItemFromGround(player, itemType, itemId);
    }
    if(!item) {
      const items = this.getItemsFromGround(player, itemType);
      if(!items) return;
      item = items[0];
    }

    if(!player.canEquip(item)) return player.sendClientMessage('You cannot equip that item.');

    player.equip(item);
    room.removeItemFromGround(item);
  }

}
