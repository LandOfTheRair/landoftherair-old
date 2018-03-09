
import { isUndefined } from 'lodash';

import { Command } from '../../../../base/Command';
import { Player } from '../../../../../shared/models/player';

export class TradeskillToEquip extends Command {

  public name = '~TtE';
  public format = 'TradeskillSlot TradeskillSrcSlot AlchUUID';

  execute(player: Player, { room, args }) {

    const [tsSlot, tsSrcSlot, alchUUID] = args.split(' ');
    if(!tsSlot || isUndefined(tsSrcSlot) || !alchUUID) return false;

    const container = room.state.findNPC(alchUUID);
    if(!container) return player.sendClientMessage('That person is not here.');

    const item = player.tradeSkillContainers[tsSlot].getItemFromSlot(+tsSrcSlot);
    if(!item) return false;

    if(!player.canEquip(item)) return player.sendClientMessage('You cannot equip that item.');

    player.equip(item);
    player.tradeSkillContainers[tsSlot].takeItemFromSlot(+tsSrcSlot);
  }

}
