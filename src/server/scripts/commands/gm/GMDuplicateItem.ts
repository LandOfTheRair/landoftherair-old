
import { Command } from '../../../base/Command';
import { Player } from '../../../../models/player';
import { merge } from 'lodash';
import { Item } from '../../../../models/item';

export class GMDuplicateItem extends Command {

  public name = '@itemdupe';
  public format = '';

  async execute(player: Player, { room, gameState, args }) {
    if(!player.isGM) return;

    if(!player.rightHand) return player.sendClientMessage('Hold an item in your right hand to modify.');
    if(player.leftHand) return player.sendClientMessage('Empty your left hand.');

    const item = new Item(player.rightHand);
    item.regenerateUUID();

    player.setLeftHand(item);

  }
}
