
import { Command } from '../../../base/Command';
import { Player } from '../../../../shared/models/player';

export class GMGainAXP extends Command {

  public name = '@axp';
  public format = 'AXP';

  async execute(player: Player, { args }) {
    if(!player.$$room.subscriptionHelper.isGM(player)) return;

    const xpGain = +args;
    player.gainAxp(xpGain);
  }
}
