
import { MaterialSlot, ReverseValidItems, ValidMaterialItems } from '../../shared/helpers/material-storage-layout';
import { Item } from '../../shared/models/item';
import { Player } from '../../shared/models/player';
import { SubscriptionHelper } from './subscription-helper';

export class MaterialStorageHelper {

  // the first item is always the correct one for withdrawing, in the event that multiple items can be deposited (ie, big/small ore)
  static getWithdrawItemIdFromSlot(slot: MaterialSlot) {
    return ReverseValidItems[slot][0];
  }

  // only valid items can be put in - duh!
  static canDepositItem(item: Item): boolean {
    return ValidMaterialItems[item.name];
  }

  // total size per stack is 200 + purchases gotten with silver
  static getTotalSizeAvailable(player: Player) {
    return 200 + SubscriptionHelper.bonusMaterialStorageSlots(player);
  }

  static withdrawItemFromSlot(player: Player, slot: MaterialSlot, count: number) {
    // remove X items from slot
    // if item stacks, remove as a single multi-oz item (delete the `ounces` property from the resulting item)
    // if item does not stack, remove X items until sack is full (merchant logic)
    // regenerate the uuid for the withdrawn item (similar to merchants)
  }

  static depositItem(player: Player, item: Item) {
    // check if can deposit
    // if no item, add the item to the slot (if no ounces property, set to 0)
    // if item, add as many ounces as can be added
  }

  static depositItemsFromSack(player: Player) {
    // go through each item and call depositItem
  }

}
