
import { Command } from '../../../base/Command';
import { Player } from '../../../../shared/models/player';
import { SubscriptionHelper } from '../../../helpers/subscription-helper';

export class GMAllegiance extends Command {

  public name = '@allegiance';
  public format = 'Allegiance';

  async execute(player: Player, { args }) {
    if(!SubscriptionHelper.isGM(player)) return;
    if(!args) return false;

    player.allegiance = args;
    player.sendClientMessage(`Your allegiance is now "${args}".`);
  }
}
