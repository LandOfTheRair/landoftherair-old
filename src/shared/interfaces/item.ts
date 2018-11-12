import { Alignment, ICharacter, Stats } from './character';

export type DamageType =
  'physical'
  | 'necrotic'
  | 'fire'
  | 'ice'
  | 'water'
  | 'energy'
  | 'poison'
  | 'disease';

export const ValidItemTypes = [
  'Mace', 'Axe', 'Dagger', 'Wand', 'Onehanded', 'Twohanded', 'Polearm', 'Ranged',
  'Martial', 'Staff', 'Restoration', 'Conjuration', 'Throwing', 'Thievery', 'Shortsword'
];

export const WeaponClasses = [
  'Axe', 'Blunderbuss', 'Broadsword', 'Crossbow', 'Dagger', 'Club', 'Flail', 'Greataxe', 'Greatmace', 'Greatsword',
  'Hammer', 'Halberd', 'Longbow', 'Longsword', 'Mace', 'Saucer', 'Shield', 'Shortbow', 'Shortsword', 'Spear', 'Staff',
  'Totem', 'Wand'
];

export const AmmoClasses = [
  'Arrow'
];

export const SharpWeaponClasses = [
  'Axe', 'Blunderbuss', 'Broadsword', 'Crossbow', 'Dagger', 'Greataxe', 'Greatsword', 'Halberd', 'Longbow',
  'Longsword', 'Shortbow', 'Shortsword', 'Spear'
];

export const ShieldClasses = [
  'Shield', 'Saucer'
];

export const ArmorClasses = [
  'Tunic', 'Breastplate', 'Fur', 'Fullplate', 'Scaleplate'
];

export const RobeClasses = [
  'Cloak', 'Robe'
];

export const HeadClasses = [
  'Hat', 'Helm', 'Skull', 'Saucer'
];

export const NeckClasses = [
  'Amulet'
];

export const WaistClasses = [
  'Sash'
];

export const WristsClasses = [
  'Bracers'
];

export const RingClasses = [
  'Ring'
];

export const FeetClasses = [
  'Boots'
];

export const HandsClasses = [
  'Gloves', 'Claws'
];

export const EarClasses = [
  'Earring'
];

export const EquipHash = {};
ArmorClasses.forEach(t => EquipHash[t] = 'Armor');
RobeClasses.forEach(t => EquipHash[t] = 'Robe');
HeadClasses.forEach(t => EquipHash[t] = 'Head');
NeckClasses.forEach(t => EquipHash[t] = 'Neck');
WaistClasses.forEach(t => EquipHash[t] = 'Waist');
WristsClasses.forEach(t => EquipHash[t] = 'Wrists');
RingClasses.forEach(t => EquipHash[t] = 'Ring');
FeetClasses.forEach(t => EquipHash[t] = 'Feet');
HandsClasses.forEach(t => EquipHash[t] = 'Hands');
EarClasses.forEach(t => EquipHash[t] = 'Ear');

export const GivesBonusInHandItemClasses = WeaponClasses.concat(NeckClasses).concat(AmmoClasses);

export const CanUseEffectItemClasses = WeaponClasses.concat(HandsClasses).concat(AmmoClasses);

export const EquippableItemClasses = HeadClasses
  .concat(NeckClasses)
  .concat(WaistClasses)
  .concat(WristsClasses)
  .concat(RingClasses)
  .concat(FeetClasses)
  .concat(HandsClasses)
  .concat(ArmorClasses)
  .concat(RobeClasses)
  .concat(EarClasses);

export const EquippableItemClassesWithWeapons = EquippableItemClasses
  .concat(WeaponClasses)
  .concat(AmmoClasses);

export class ItemRequirements {
  level?: number;
  profession?: string[];
  alignment?: Alignment;
  quest?: string;
  skill?: { name: string, level: number };
}

export class Encrust {
  name?: string;
  desc: string;
  sprite: number;
  stats: any = {};
  value: number;
  maxEncrusts?: number;
}

export class ItemCosmetic {
  name: string;
  isPermanent?: boolean;
}

export class ItemEffect {
  name: string;
  chance?: number;
  potency: number;
  uses?: number;
  autocast?: boolean;
  canApply?: boolean;
  range?: number; // used for traps
}

export enum Quality {
  POOR = 1,
  BELOW_AVERAGE = 2,
  AVERAGE = 3,
  ABOVE_AVERAGE = 4,
  PERFECT = 5
}

export interface IItem {
  _id?: string;

  name: string;
  desc?: string;
  extendedDesc?: string;
  sprite?: number;
  itemClass: string;
  createdAt?: number;

  encrust?: Encrust;
  quality?: Quality;
  damageClass?: DamageType;
  cosmetic?: ItemCosmetic;

  uuid?: string;

  owner?: string;

  tier: number;

  ounces?: number;
  value?: number;
  maxEncrusts?: number;
  _buybackValue?: number;
  sellValue?: number;
  stats?: Stats;
  requirements?: ItemRequirements;
  condition?: number;
  type?: string;
  secondaryType?: string;

  twoHanded?: boolean;
  proneChance?: number;

  isBeltable?: boolean;
  isSackable?: boolean;

  attackRange?: number;
  offhand?: boolean;
  returnsOnThrow?: boolean;
  binds?: boolean;
  tellsBind?: boolean;

  isHeavy?: boolean;
  canShoot?: boolean;
  shots?: number;
  trapUses?: number;

  trait?: { name: string, level: number };

  bookPage?: number;        // the page this item fits into
  bookPages?: Array<{ id: string, text: string }>;
  bookItemFilter?: string;
  bookCurrentPage?: number; // the page this book is on

  enchantLevel?: number;

  searchItems?: IItem[];

  tansFor?: string;

  x?: number;
  y?: number;

  $heldBy?: any;
  $$isPlayerCorpse?: boolean;
  $$playersHeardDeath?: string[];

  effect?: ItemEffect;

  succorInfo?: { map: string, x: number, y: number, z: number };
  destroyOnDrop?: boolean;

  containedItems?: Array<{ chance: number, result: string }>;
  expiresAt?: number;
  notUsableAfterHours?: number;

  daily?: boolean;
  previousUpgrades?: any[];

  usesString(): string;
  conditionString(): string;
  conditionACModifier(): number;

  hasCondition(): boolean;
  loseCondition(val: number, onBreak: Function): void;

  descTextFor(player: ICharacter, senseLevel: number, fromClient?: boolean): string;

  setOwner(player: ICharacter): void;
  isOwnedBy(player: ICharacter): boolean;
  canUseInCombat(player: ICharacter): boolean;
  canUse(char: ICharacter): boolean;
  use(char: ICharacter, fromApply: boolean): boolean;

  canUseExpiration(): boolean;

  castAndTryBreak(): boolean;

  hasPageCount(total: number): boolean;
}
