
import { extend, clone, includes } from 'lodash';

import { Container } from '../container';
import { ArmorClasses, IItem, WeaponClasses } from '../../../interfaces/item';
import { IMetalworkingContainer } from '../../../interfaces/container';

export class MetalworkingContainer extends Container implements IMetalworkingContainer {

  protected autoFix = false;

  private ore = {
    copper: 0,
    silver: 0,
    gold: 0
  };

  get oreValues() {
    return clone(this.ore);
  }

  constructor(opts) {
    super({ size: 6 });
    extend(this, opts);
    this.initItems();
  }

  get craftItem(): IItem {
    return this.items[0];
  }

  get craftReagent(): IItem {
    return this.items[1];
  }

  get craftResult(): IItem {
    return this.items[2];
  }

  set craftResult(item: IItem) {
    this.items[2] = item;
  }

  get upgradeItem(): IItem {
    return this.items[3];
  }

  get upgradeReagent(): IItem {
    return this.items[4];
  }

  get upgradeResult(): IItem {
    return this.items[5];
  }

  set upgradeResult(item: IItem) {
    this.items[5] = item;
  }

  gainOre(oreType: string, number = 1) {
    this.ore[oreType] += number;
  }

  clearCraft() {
    this.items[0] = null;
    this.items[1] = null;
  }

  clearUpgrade() {
    this.items[3] = null;
    this.items[4] = null;
  }

  clearCraftIngredient() {
    this.items[1] = null;
  }

  clearUpgradeIngredient() {
    this.items[4] = null;
  }

  canAccept(item, index?: number) {
    if(index < 0 || index === 2 || index >= 5) return false;

    // index === 0 = main slot armor (tunic or breastplate)

    // index === 1 = upgrade component (scale, etc)
    if(index === 1
    && item.itemClass !== 'Scale'
    && item.itemClass !== 'Twig'
    && !includes(item.name, 'Enchanting Brick')
    && !includes(item.name, 'Ore')) return false;

    // index === 2 = mold output

    // index === 3 = main slot armor (any) or weapon (any)
    if(index === 3
    && item.itemClass !== 'Boots'
    && item.itemClass !== 'Gloves'
    && item.itemClass !== 'Claws'
    && !includes(ArmorClasses, item.itemClass)
    && !includes(WeaponClasses, item.itemClass)) return false;

    // index === 4 = upgrade component (ingot or fur)
    if(index === 4 && !includes(item.name, 'Ingot') && item.itemClass !== 'Fur') return false;

    // index === 5 = upgrade output
    return super.canAccept(item);
  }
}
