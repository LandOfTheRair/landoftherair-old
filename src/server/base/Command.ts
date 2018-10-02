
import { Player } from '../../shared/models/player';
import { find } from 'lodash';
import { Item } from '../../shared/models/item';
import { Container } from '../../shared/models/container/container';
import { MapLayer } from '../../shared/models/maplayer';
import { MessageHelper } from '../helpers/world/message-helper';
import { MaterialStorageHelper } from '../helpers/tradeskill/material-storage-helper';
import { Locker } from '../../shared/models/container/locker';
import { NPC } from '../../shared/models/npc';

export abstract class Command {

  static macroMetadata: any = {};
  abstract name: string|string[];
  format = '';
  requiresLearn: boolean;
  monsterSkill: boolean;
  unableToLearnFromStealing: boolean;

  abstract execute(player: Player, args);

  getMergeObjectFromArgs(args) {
    return MessageHelper.getMergeObjectFromArgs(args);
  }

  trySwapLeftToRight(player) {
    if(player.leftHand && !player.rightHand) {
      player.setRightHand(player.leftHand);
    }
  }

  trySwapRightToLeft(player) {
    if(player.rightHand && !player.leftHand) {
      player.setLeftHand(player.rightHand);
    }
  }

  getEmptyHand(player) {
    if(player.rightHand && player.leftHand) return '';
    if(player.rightHand) return 'LeftHand';
    if(player.leftHand) return 'RightHand';
    return 'RightHand';
  }

  addItemToContainer(player, container: Container, item: Item, index?: number) {
    if(!container) return player.sendClientMessage('Bad container name.');
    const didFail = container.addItem(item, index, { maxSize: MaterialStorageHelper.getTotalSizeAvailable(player) });
    if(didFail) return player.sendClientMessage(didFail);
    return true;
  }

  getNPCInView(player, uuid): NPC {
    return player.$$room.state.findNPC(uuid);
  }

  checkMerchantDistance(player, merchantUUID) {
    const container = player.$$room.state.findNPC(merchantUUID);
    if(!container) return player.sendClientMessage('That person is not here.');
    if(container.distFrom(player) > 2) return player.sendClientMessage('That person is too far away.');
    return true;
  }

  checkMerchantItems(player, merchantUUID, itemUUID) {
    const container = player.$$room.state.findNPC(merchantUUID);
    if(!container) return player.sendClientMessage('That person is not here.');

    const item = find(container.vendorItems, { uuid: itemUUID });
    if(!item) return player.sendClientMessage('You do not see that item.');

    return item;
  }

  checkPlayerEmptyHand(player) {
    const hasHands = player.hasEmptyHand();
    if(!hasHands) return player.sendClientMessage('Your hands are full.');
    return true;
  }

  findLocker(player) {
    const locker = find(player.$$room.state.map.layers[MapLayer.Interactables].objects, { x: player.x * 64, y: (player.y + 1) * 64, type: 'Locker' });
    if(!locker) return player.sendClientMessage('There is no locker there.');
    return locker;
  }

  getItemsFromGround(player, itemClass): Item[] {
    const ground = player.$$room.state.getGroundItems(player.x, player.y);
    const items = ground[itemClass];
    if(!items) return player.sendClientMessage('You do not see that item.');
    return items;
  }

  getItemFromGround(player, itemClass, itemId): Item {
    const ground = player.$$room.state.getGroundItems(player.x, player.y);
    const item: any = find(ground[itemClass], { uuid: itemId });
    if(!item) return player.sendClientMessage('You do not see that item.');
    return item;
  }

  accessLocker(player: Player) {
    player.$$isAccessingLocker = true;
  }

  unaccessLocker(player: Player, locker?: Locker) {
    player.$$isAccessingLocker = false;
    if(locker) {
      player.$$room.updateLocker(player, locker);
    }
  }

  isAccessingLocker(player: Player) {
    return player.$$isAccessingLocker;
  }

  takeItemCheck(player: Player, item: Item): boolean {
    if(!player.canTakeItem(item)) {
      player.sendClientMessage('You don\'t need that item right now.');
      return false;
    }

    return true;
  }
}
