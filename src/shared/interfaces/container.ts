import { IItem } from './item';

export interface IContainer {
  size: number;
  allItems: IItem[];
  hasItems: boolean;

  isFull(): boolean;
  addItem(item: IItem, index?: number, extra?: any): string;
  getItemFromSlot(slot: number): IItem;
  takeItemFromSlot(slot: number, amt?: number): IItem;
  randomItem(): IItem;
  takeItem(item: IItem): IItem;
  takeItemFromSlots(slots: number[]): IItem[];
  canAccept(item: IItem, index?: number): boolean;
}

export interface IAlchemyContainer extends IContainer {
  reagents: IItem[];
  result: IItem;

  clearReagents(): void;
}

export interface ISpellforgingContainer extends IContainer {
  dustValues: any;

  modifyItem: IItem;
  reagent: IItem;
  result: IItem;

  gainDust(dust: string, val: number): void;

  clearReagents(): void;
  clearIngredient(): void;
}

export interface IMetalworkingContainer extends IContainer {
  oreValues: any;

  craftItem: IItem;
  craftReagent: IItem;
  craftResult: IItem;

  upgradeItem: IItem;
  upgradeReagent: IItem;
  upgradeResult: IItem;

  gainOre(ore: string, val: number): void;

  clearCraft(): void;
  clearUpgrade(): void;
  clearCraftIngredient(): void;
  clearUpgradeIngredient(): void;
}
