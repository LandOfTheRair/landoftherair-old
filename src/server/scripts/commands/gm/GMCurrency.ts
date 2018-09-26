
import { Command } from '../../../base/Command';
import { Player } from '../../../../shared/models/player';

export class GMCurrency extends Command {

  public name = '@currency';
  public format = 'CurrencyType Value';

  async execute(player: Player, { room, args }) {
    if(!player.$$room.subscriptionHelper.isGM(player)) return;

    let [type, value] = args.split(' ');

    type = type.toLowerCase();
    value = Math.round(+value);
    if(!type || !value || isNaN(value)) return false;

    player.earnCurrency(type, value);
  }
}
