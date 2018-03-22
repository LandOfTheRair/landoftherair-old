
import { invertBy } from 'lodash';

// these should *never* be changed
export enum MaterialSlot {
  CopperOre = 0,
  SilverOre = 1,
  GoldOre = 2,
  CopperIngot = 3,
  SilverIngot = 4,
  GoldIngot = 5,
  RyltFlower = 6,
  YzaltFlower = 7,
  YzaltApple = 8,
  TowerFlower = 9,
  MazeFlower = 10
}

// the valid items for deposit and the slot they map to
export const ValidMaterialItems = {
  'Copper Ore (Small)': MaterialSlot.CopperOre,
  'Copper Ore (Large)': MaterialSlot.CopperOre,
  'Silver Ore (Small)': MaterialSlot.SilverOre,
  'Silver Ore (Large)': MaterialSlot.SilverOre,
  'Gold Ore (Small)': MaterialSlot.GoldOre,
  'Gold Ore (Large)': MaterialSlot.GoldOre,
  'Copper Ingot (Pillars)': MaterialSlot.CopperIngot,
  'Silver Ingot (Hourglass)': MaterialSlot.SilverIngot,
  'Gold Ingot (Infinity)': MaterialSlot.GoldIngot,
  'Rylt Blueflower': MaterialSlot.RyltFlower,
  'Yzalt Bogweed': MaterialSlot.YzaltFlower,
  'Yzalt Steffen Apple': MaterialSlot.YzaltApple,
  'Tower Goblood': MaterialSlot.TowerFlower,
  'Maze Corpseflower': MaterialSlot.MazeFlower
};

export const ReverseValidItems = invertBy(ValidMaterialItems);

export const MaterialSlotInfo = {
  [MaterialSlot.CopperOre]:             { sprite: 993,  withdrawInOunces: true },
  [MaterialSlot.SilverOre]:             { sprite: 614,  withdrawInOunces: true },
  [MaterialSlot.GoldOre]:               { sprite: 950,  withdrawInOunces: true },
  [MaterialSlot.CopperIngot]:           { sprite: 996,  withdrawInOunces: false },
  [MaterialSlot.SilverIngot]:           { sprite: 1001, withdrawInOunces: false },
  [MaterialSlot.GoldIngot]:             { sprite: 409,  withdrawInOunces: false },
  [MaterialSlot.RyltFlower]:            { sprite: 740,  withdrawInOunces: false },
  [MaterialSlot.YzaltFlower]:           { sprite: 742,  withdrawInOunces: false },
  [MaterialSlot.YzaltApple]:            { sprite: 560,  withdrawInOunces: false },
  [MaterialSlot.TowerFlower]:           { sprite: 736,  withdrawInOunces: false },
  [MaterialSlot.MazeFlower]:            { sprite: 750,  withdrawInOunces: false }
};

// these *can* be changed to adjust the layout of the slots
const RAW_MATERIAL_LAYOUT = [
  MaterialSlot.CopperOre, MaterialSlot.SilverOre, MaterialSlot.GoldOre, null, null,
  MaterialSlot.CopperIngot, MaterialSlot.SilverIngot, MaterialSlot.GoldIngot, null, null
];

const FLOWER_LAYOUT = [
  MaterialSlot.RyltFlower, MaterialSlot.YzaltFlower, MaterialSlot.YzaltApple, MaterialSlot.TowerFlower, MaterialSlot.MazeFlower
];

export const MaterialStorageLayout = [
  { category: 'Ore & Ingots', layout: RAW_MATERIAL_LAYOUT },
  { category: 'Flowers',      layout: FLOWER_LAYOUT }
];
