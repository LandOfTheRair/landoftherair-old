
import { Command } from '../../../base/Command';
import { Player } from '../../../../shared/models/player';

export class GMGainXP extends Command {

  public name = '@xp';
  public format = 'XP';

  async execute(player: Player, { args }) {
    if(!player.$$room.subscriptionHelper.isGM(player)) return;

    const xpGain = +args;
    player.gainExp(xpGain);
  }
}
