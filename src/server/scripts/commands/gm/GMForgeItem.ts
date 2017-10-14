
import { Command } from '../../../base/Command';
import { Player } from '../../../../shared/models/player';
import { Item, EquippableItemClassesWithWeapons, ValidItemTypes } from '../../../../shared/models/item';
import { includes } from 'lodash';

export class GMForgeItem extends Command {

  public name = '@itemforge';
  public format = 'Props...';

  async execute(player: Player, { room, gameState, args }) {
    if(!player.isGM) return;

    if(player.rightHand) return player.sendClientMessage('Empty your right hand first.');

    const mergeObj = this.getMergeObjectFromArgs(args);
    if(!mergeObj.name)    return player.sendClientMessage('You need to specify a name.');
    if(!mergeObj.desc)    return player.sendClientMessage('You need to specify a desc.');
    if(!mergeObj.sprite)  return player.sendClientMessage('You need to specify a sprite.');
    if(!mergeObj.itemClass)  return player.sendClientMessage('You need to specify an itemClass.');

    if(!includes(EquippableItemClassesWithWeapons, mergeObj.itemClass)) {
      player.sendClientMessage('WARN: This item is not a valid equippable item or a weapon.');
    }

    if(!includes(ValidItemTypes, mergeObj.type)) {
      player.sendClientMessage(`WARN: ${mergeObj.type || '(none)'} is not a valid type (for skills). Setting to Martial.`);
      mergeObj.type = 'Martial';
    }

    const item = new Item(mergeObj);
    player.setRightHand(item);

  }
}
