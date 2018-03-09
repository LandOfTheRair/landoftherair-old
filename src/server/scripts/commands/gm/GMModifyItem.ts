
import { Command } from '../../../base/Command';
import { Player } from '../../../../shared/models/player';
import { merge } from 'lodash';
import { SubscriptionHelper } from '../../../helpers/account/subscription-helper';

export class GMModifyItem extends Command {

  public name = '@itemmod';
  public format = 'Props...';

  async execute(player: Player, { args }) {
    if(!SubscriptionHelper.isGM(player)) return;

    if(!player.rightHand) return player.sendClientMessage('Hold an item in your right hand to modify.');

    const mergeObj = this.getMergeObjectFromArgs(args);

    merge(player.rightHand, mergeObj);

  }
}
