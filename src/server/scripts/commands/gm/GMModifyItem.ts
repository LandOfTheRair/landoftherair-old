
import { Command } from '../../../base/Command';
import { Player } from '../../../../models/player';
import { merge } from 'lodash';

export class GMModifyItem extends Command {

  public name = '@itemmod';
  public format = 'Props...';

  async execute(player: Player, { room, gameState, args }) {
    if(!player.isGM) return;

    if(!player.rightHand) return player.sendClientMessage('Hold an item in your right hand to modify.');

    const mergeObj = this.getMergeObjectFromArgs(args);

    merge(player.rightHand, mergeObj);

  }
}
