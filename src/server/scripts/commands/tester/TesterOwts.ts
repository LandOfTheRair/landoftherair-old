
import { Command } from '../../../base/Command';
import { Player } from '../../../../shared/models/player';
import { TesterHelper } from '../../../helpers/tester/tester-helper';

export class TesterOwts extends Command {

  public name = '^owts';
  public format = 'Boost';

  async execute(player: Player, { args }) {
    if(!player.$$room.subscriptionHelper.isGM(player) && !player.$$room.subscriptionHelper.isTester(player)) return;

    const boost = Math.floor(+args);
    if(isNaN(boost)) return false;

    TesterHelper.owtsAllGear(player, boost);
  }

}
