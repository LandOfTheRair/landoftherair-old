
import { Command } from '../../../../base/Command';
import { Player } from '../../../../../shared/models/player';

export class SackToMerchant extends Command {

  public name = '~StM';
  public format = 'Slot MerchantUUID';

  execute(player: Player, { room, args }) {
    if(this.isAccessingLocker(player)) return;

    const [slot, merchantUUID] = args.split(' ');

    if(!this.checkMerchantDistance(player, merchantUUID)) return;

    const npc = this.getNPCInView(player, merchantUUID);
    if(npc.$$vendorCurrency) return player.sendClientMessage('Sorry, if you want to sell stuff you gotta go somewhere else.');

    const itemCheck = player.sack.getItemFromSlot(+slot);
    if(!itemCheck) return false;
    if(!itemCheck.isOwnedBy(player)) return player.sendClientMessage('That is not yours!');

    const item = player.sack.takeItemFromSlot(+slot);
    if(!item) return false;

    player.sellItem(item);
  }

}
