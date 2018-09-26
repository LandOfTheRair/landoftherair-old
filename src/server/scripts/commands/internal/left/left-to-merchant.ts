
import { Command } from '../../../../base/Command';
import { Player } from '../../../../../shared/models/player';

export class LeftToMerchant extends Command {

  public name = '~LtM';
  public format = 'MerchantUUID';

  execute(player: Player, { args }) {
    const item = player.leftHand;

    if(this.isAccessingLocker(player)) return;
    if(!item) return;

    if(!this.checkMerchantDistance(player, args)) return;

    const npc = this.getNPCInView(player, args);
    if(!item.isOwnedBy(player)) return player.sendClientMessageFromNPC(npc, 'That is not yours!');
    if(npc.$$vendorCurrency) return player.sendClientMessageFromNPC(npc, 'Sorry, if you want to sell stuff you gotta go somewhere else.');

    player.sellItem(item);
    player.setLeftHand(null);
  }

}
