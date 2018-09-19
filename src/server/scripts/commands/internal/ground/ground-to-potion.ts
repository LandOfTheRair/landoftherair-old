
import { Command } from '../../../../base/Command';
import { Player } from '../../../../../shared/models/player';

export class GroundToPotion extends Command {

  public name = '~GtP';
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

    if(!item) return;
    if(!this.takeItemCheck(player, item)) return;

    if(item.itemClass !== 'Bottle') return player.sendClientMessage('That item is not a bottle.');

    if(player.potionHand) return player.sendClientMessage('Your potion slot is occupied.');

    player.setPotionHand(item);
    room.removeItemFromGround(item);
  }

}
