
import { Command } from '../../../../base/Command';
import { Player } from '../../../../../shared/models/player';

export class RightToMerchant extends Command {

  public name = '~RtM';
  public format = 'MerchantUUID';

  execute(player: Player, { args }) {
    if(this.isAccessingLocker(player)) return;
    const item = player.rightHand;

    if(!item) return;
    if(!item.isOwnedBy(player)) return player.sendClientMessage('That is not yours!');

    if(!this.checkMerchantDistance(player, args)) return;

    const npc = this.getNPCInView(player, args);
    if(npc.$$vendorCurrency) return player.sendClientMessage('Sorry, if you want to sell stuff you gotta go somewhere else.');

    player.sellItem(item);
    player.setRightHand(null);
  }

}
