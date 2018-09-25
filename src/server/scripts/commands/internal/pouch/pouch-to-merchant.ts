
import { Command } from '../../../../base/Command';
import { Player } from '../../../../../shared/models/player';

export class PouchToMerchant extends Command {

  public name = '~DtM';
  public format = 'Slot MerchantUUID';

  execute(player: Player, { room, args }) {
    if(this.isAccessingLocker(player)) return;

    const [slot, merchantUUID] = args.split(' ');

    if(!this.checkMerchantDistance(player, args)) return;

    const npc = this.getNPCInView(player, merchantUUID);
    if(npc.$$vendorCurrency) return player.sendClientMessage('Sorry, if you want to sell stuff you gotta go somewhere else.');

    const itemCheck = player.pouch.getItemFromSlot(+slot);
    if(!itemCheck) return false;
    if(!itemCheck.isOwnedBy(player)) return player.sendClientMessage('That is not yours!');

    const item = player.pouch.takeItemFromSlot(+slot);
    if(!item) return false;

    player.sellItem(item);
  }

}
