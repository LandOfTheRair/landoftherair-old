
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
  MazeFlower = 10,
  RedEtherScale = 11,
  RedEtherScaleRefined = 12,
  MinesFlower = 13,
  AntanianTwig = 14,
  AntanianBranch = 15,
  RisanTwig = 16,
  RisanBranch = 17,
  RisanFrozenTwig = 18
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
  'Maze Corpseflower': MaterialSlot.MazeFlower,
  'Ether Scale': MaterialSlot.RedEtherScale,
  'Ether Scale (Refined)': MaterialSlot.RedEtherScaleRefined,
  'Mines Caveflower': MaterialSlot.MinesFlower,
  'Antanian Twig': MaterialSlot.AntanianTwig,
  'Antanian Branch': MaterialSlot.AntanianBranch,
  'Risan Twig': MaterialSlot.RisanTwig,
  'Risan Branch': MaterialSlot.RisanBranch,
  'Risan Frozen Twig': MaterialSlot.RisanFrozenTwig
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
  [MaterialSlot.MazeFlower]:            { sprite: 750,  withdrawInOunces: false },
  [MaterialSlot.RedEtherScale]:         { sprite: 965,  withdrawInOunces: false },
  [MaterialSlot.RedEtherScaleRefined]:  { sprite: 965,  withdrawInOunces: false },
  [MaterialSlot.MinesFlower]:           { sprite: 761,  withdrawInOunces: false },
  [MaterialSlot.AntanianTwig]:          { sprite: 222,  withdrawInOunces: false },
  [MaterialSlot.AntanianBranch]:        { sprite: 602,  withdrawInOunces: false },
  [MaterialSlot.RisanTwig]:             { sprite: 222,  withdrawInOunces: false },
  [MaterialSlot.RisanBranch]:           { sprite: 602,  withdrawInOunces: false },
  [MaterialSlot.RisanFrozenTwig]:       { sprite: 282,  withdrawInOunces: false }
};

// these *can* be changed to adjust the layout of the slots
const RAW_MATERIAL_LAYOUT = [
  MaterialSlot.CopperOre, MaterialSlot.SilverOre, MaterialSlot.GoldOre, null, null,
  MaterialSlot.CopperIngot, MaterialSlot.SilverIngot, MaterialSlot.GoldIngot, null, null,
  MaterialSlot.AntanianTwig, MaterialSlot.AntanianBranch, MaterialSlot.RisanTwig, MaterialSlot.RisanBranch, MaterialSlot.RisanFrozenTwig
];

const FLOWER_LAYOUT = [
  MaterialSlot.RyltFlower, MaterialSlot.YzaltFlower, MaterialSlot.YzaltApple, MaterialSlot.TowerFlower, MaterialSlot.MazeFlower,
  MaterialSlot.MinesFlower, null, null, null, null
];

const SCALE_LAYOUT = [
  MaterialSlot.RedEtherScale, null, null, null, null,
  MaterialSlot.RedEtherScaleRefined, null, null, null, null
];

export const MaterialStorageLayout = [
  { category: 'Natural Resources', layout: RAW_MATERIAL_LAYOUT },
  { category: 'Flowers',      layout: FLOWER_LAYOUT },
  { category: 'Scales',       layout: SCALE_LAYOUT }
];
