
import { Command } from '../../../base/Command';
import { Player } from '../../../../shared/models/player';
import { TesterHelper } from '../../../helpers/tester/tester-helper';

export class TesterResetTraits extends Command {

  public name = '^traits';
  public format = '';

  async execute(player: Player) {
    if(!player.$$room.subscriptionHelper.isGM(player) && !player.$$room.subscriptionHelper.isTester(player)) return;

    TesterHelper.resetTraits(player);
  }

}
