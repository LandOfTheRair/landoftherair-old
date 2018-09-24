
import { Command } from '../../../base/Command';
import { Player } from '../../../../shared/models/player';
import { TesterHelper } from '../../../helpers/tester/tester-helper';

export class TesterGainGold extends Command {

  public name = '^currentGold';
  public format = 'Gold';

  async execute(player: Player, { args }) {
    if(!player.$$room.subscriptionHelper.isGM(player) && !player.$$room.subscriptionHelper.isTester(player)) return;

    const gold = Math.floor(+args);
    if(gold < 1 || isNaN(gold)) return false;

    TesterHelper.gainGold(player, gold);
  }

}
