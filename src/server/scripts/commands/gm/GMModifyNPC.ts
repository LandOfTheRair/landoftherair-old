
import { Command } from '../../../base/Command';
import { Player } from '../../../../shared/models/player';
import { merge } from 'lodash';
import { MessageHelper } from '../../../helpers/world/message-helper';
import { SubscriptionHelper } from '../../../helpers/account/subscription-helper';

export class GMModifyNPC extends Command {

  public name = '@npcmod';
  public format = 'Target Props...';

  async execute(player: Player, { args }) {
    if(!SubscriptionHelper.isGM(player)) return;

    const [npcish, props] = args.split(' ', 2);
    const possTargets = MessageHelper.getPossibleMessageTargets(player, npcish);
    if(!possTargets.length) return player.sendClientMessage('You do not see that person.');

    const target = possTargets[0];
    if(!target) return false;

    const fullProps = args.substring(args.indexOf(props));

    const mergeObj = this.getMergeObjectFromArgs(fullProps);

    merge(target, mergeObj);

  }
}
