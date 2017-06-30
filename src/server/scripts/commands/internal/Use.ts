
import { startsWith, find } from 'lodash';

import { Command } from '../../../base/Command';
import { Player } from '../../../../models/player';

export class Use extends Command {

  public name = '~use';

  execute(player: Player, { room, gameState, args }) {
    const [context, slot, itemType, itemId] = args.split(' ');

    const useItemInHand = (slot) => {
      player.useItem(slot);
    };

    if(context === 'Left') return useItemInHand('leftHand');
    if(context === 'Right') return useItemInHand('rightHand');

    if(!player.hasEmptyHand()) return player.sendClientMessage('Your hands are full!');

    const emptyHand = player.leftHand ? 'Right' : 'Left';
    const slotName = `${emptyHand.toLowerCase()}Hand`;
    const func = player[`set${emptyHand}Hand`].bind(player);

    switch(context) {
      case 'Sack': {
        const item = player.sack.getItemFromSlot(+slot);
        func(item);
        useItemInHand(slotName);
        player.sack.takeItemFromSlot(+slot);
        return;
      }

      case 'Belt': {
        const item = player.belt.getItemFromSlot(+slot);
        func(item);
        player.belt.takeItemFromSlot(+slot);
        useItemInHand(slotName);
        return;
      }

      case 'Ground': {
        const ground = gameState.getGroundItems(player.x, player.y);
        if(!ground[itemType]) return player.sendClientMessage('You do not see that item.');

        const item = find(ground[itemType], { uuid: itemId });
        if(!item) return player.sendClientMessage('You do not see that item.');

        func(item);
        room.removeItemFromGround(item);
        useItemInHand(slotName);
        return;
      }
    }
  }

}
