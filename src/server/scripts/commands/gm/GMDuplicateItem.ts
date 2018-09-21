
import { Command } from '../../../base/Command';
import { Player } from '../../../../shared/models/player';

export class GMDuplicateItem extends Command {

  public name = '@itemdupe';
  public format = '';

  async execute(player: Player) {
    if(!player.$$room.subscriptionHelper.isGM(player)) return;

    if(!player.rightHand) return player.sendClientMessage('Hold an item in your right hand to modify.');
    if(player.leftHand) return player.sendClientMessage('Empty your left hand.');
    
    player.setLeftHand(player.$$room.itemCreator.duplicateItem(player.rightHand));

  }
}
