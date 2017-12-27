
import { find, isUndefined } from 'lodash';

import { Command } from '../../../../base/Command';
import { Player } from '../../../../../shared/models/player';

export class PotionToTradeskill extends Command {

  public name = '~PtT';
  public format = 'TradeskillSlot TradeskillDestSlot AlchUUID';

  execute(player: Player, { room, gameState, args }) {
    if(this.isAccessingLocker(player)) return;
    const [tsSlot, tsDestSlot, alchUUID] = args.split(' ');
    if(!tsSlot || isUndefined(tsDestSlot) || !alchUUID) return false;

    const container = room.state.findNPC(alchUUID);
    if(!container) return player.sendClientMessage('That person is not here.');

    const item = player.potionHand;
    if(!item) return;

    const added = this.addItemToContainer(player, player.tradeSkillContainers[tsSlot], item, +tsDestSlot);
    if(!added) return;

    player.setPotionHand(null);
  }

}
