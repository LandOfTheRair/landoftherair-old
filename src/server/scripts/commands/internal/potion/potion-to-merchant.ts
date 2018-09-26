
import { Command } from '../../../../base/Command';
import { Player } from '../../../../../shared/models/player';

export class PotionToMerchant extends Command {

  public name = '~PtM';
  public format = 'MerchantUUID';

  execute(player: Player, { room, args }) {
    if(this.isAccessingLocker(player)) return;

    const merchantUUID = args;

    if(!this.checkMerchantDistance(player, merchantUUID)) return;

    const npc = this.getNPCInView(player, args);
    if(npc.$$vendorCurrency) return player.sendClientMessageFromNPC(npc, 'Sorry, if you want to sell stuff you gotta go somewhere else.');

    const item = player.potionHand;
    if(!item) return false;
    if(!item.isOwnedBy(player)) return player.sendClientMessageFromNPC(npc, 'That is not yours!');

    player.setPotionHand(null);
    player.sellItem(item);
  }

}
