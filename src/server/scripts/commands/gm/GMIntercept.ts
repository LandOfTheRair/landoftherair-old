
import { Command } from '../../../base/Command';
import { Player } from '../../../../shared/models/player';
import { SubscriptionHelper } from '../../../helpers/account/subscription-helper';
import { MessageHelper } from '../../../helpers/world/message-helper';

export class GMIntercept extends Command {

  public name = '@intercept';
  public format = 'Charish';

  async execute(player: Player, { args }) {
    if(!SubscriptionHelper.isGM(player)) return;
    if(!args) return false;

    const possTargets = MessageHelper.getPossibleMessageTargets(player, args);
    if(!possTargets.length) return player.sendClientMessage('You do not see that person.');

    const target = possTargets[0];
    if(!target) return false;
    if(target === player) return player.sendClientMessage('You cannot intercept yourself!');

    target.$$interceptor = target.$$interceptor ? null : player;

    if(target.$$interceptor) return player.sendClientMessage(`You are now intercepting ${target.name}.`);

    player.sendClientMessage(`You are no longer intercepting ${target.name}.`);
  }
}
