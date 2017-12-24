
import { find, isUndefined } from 'lodash';

import { Command } from '../../../../base/Command';
import { Player } from '../../../../../shared/models/player';

export class RightToTradeskill extends Command {

  public name = '~RtT';
  public format = 'TradeskillSlot TradeskillDestSlot AlchUUID';

  execute(player: Player, { room, gameState, args }) {
    const [tsSlot, tsDestSlot, alchUUID] = args.split(' ');
    if(!tsSlot || isUndefined(tsDestSlot) || !alchUUID) return false;

    const container = room.state.findNPC(alchUUID);
    if(!container) return player.sendClientMessage('That person is not here.');

    const item = player.rightHand;
    if(!item) return;

    const added = this.addItemToContainer(player, player.tradeSkillContainers[tsSlot], item, +tsDestSlot);
    if(!added) return;

    player.setRightHand(null);
  }

}
