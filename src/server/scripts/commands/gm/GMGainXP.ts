
import { Command } from '../../../base/Command';
import { Player } from '../../../../shared/models/player';
import { SubscriptionHelper } from '../../../helpers/subscription-helper';

export class GMGainXP extends Command {

  public name = '@xp';
  public format = 'XP';

  async execute(player: Player, { room, gameState, args }) {
    if(!SubscriptionHelper.isGM(player)) return;

    const xpGain = +args;
    player.gainExp(xpGain);
  }
}
