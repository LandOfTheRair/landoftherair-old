
import { Command } from '../../../base/Command';
import { Player } from '../../../../shared/models/player';
import { TesterHelper } from '../../../helpers/tester/tester-helper';

export class TesterLoadout extends Command {

  public name = '^loadout';
  public format = 'Level';

  async execute(player: Player, { args }) {
    if(!player.$$room.subscriptionHelper.isGM(player) && !player.$$room.subscriptionHelper.isTester(player)) return;

    const level = Math.floor(+args);
    if(level < 1 || isNaN(level)) return false;

    if(player.baseClass === 'Undecided') return player.sendClientMessage('You need a class to get gear!');

    TesterHelper.generateLoadout(player, level);
  }

}
