import { RestrictedNumber } from 'restricted-number';
import { IAlchemyContainer, IContainer, IMetalworkingContainer, ISpellforgingContainer } from './container';
import { IItem, ItemEffect } from './item';
import { AttributeEffect, AugmentSpellEffect, IEffect, OnHitEffect } from './effect';
import { IGameWorld } from './gameworld';
import { Currency } from './holiday';
import { IAccount } from './account';
import { Statistics } from '../models/statistics';

export type Allegiance =
  'None'
  | 'Pirates'
  | 'Townsfolk'
  | 'Royalty'
  | 'Adventurers'
  | 'Wilderness'
  | 'Underground'
  | 'Enemy'
  | 'NaturalResource'
  | 'GM';

export type Sex = 'Male' | 'Female';

export type Direction = 'N' | 'S' | 'E' | 'W' | 'C';

export type Alignment = 'Good' | 'Neutral' | 'Evil';

export type CharacterClass =
  'Undecided'
  | 'Mage'
  | 'Healer'
  | 'Warrior'
  | 'Thief';

export const SkillClassNames = {
  Mace: 'Mace',
  Axe: 'Axe',
  Dagger: 'Dagger',
  OneHanded: 'Onehanded',
  TwoHanded: 'Twohanded',
  Shortsword: 'Shortsword',
  Polearm: 'Polearm',
  Ranged: 'Ranged',
  Martial: 'Martial',
  Staff: 'Staff',
  Throwing: 'Throwing',
  Thievery: 'Thievery',
  Wand: 'Wand',
  Conjuration: 'Conjuration',
  Restoration: 'Restoration',

  Alchemy: 'Alchemy',
  Spellforging: 'Spellforging',
  Runewriting: 'Runewriting',
  Metalworking: 'Metalworking',
  Survival: 'Survival'
};

export class Skills {

  // combat skills
  mace = 0;
  axe = 0;
  dagger = 0;
  onehanded = 0;
  twohanded = 0;
  shortsword = 0;
  polearm = 0;
  ranged = 0;
  martial = 0;
  staff = 0;
  throwing = 0;
  thievery = 0;
  wand = 0;
  conjuration = 0;
  restoration = 0;

  // trade skills
  alchemy = 0;
  spellforging = 0;
  metalworking = 0;
  survival = 0;
  runewriting = 0;
}

export class Stats {
  str? = 0;
  dex? = 0;
  agi? = 0;

  int? = 0;
  wis? = 0;
  wil? = 0;

  luk? = 0;
  cha? = 0;
  con? = 0;

  move? = 3;
  hpregen? = 1;
  mpregen? = 1;

  hp? = 100;
  mp? = 0;

  weaponDamageRolls? = 0;
  weaponArmorClass? = 0;
  armorClass? = 0;
  accuracy? = 0;
  offense? = 0;
  defense? = 0;

  stealth? = 0;
  perception? = 0;

  physicalDamageBoost? = 0;
  magicalDamageBoost? = 0;
  healingBoost? = 0;

  physicalDamageReflect? = 0;
  magicalDamageReflect? = 0;

  mitigation? = 0;
  magicalResist? = 0;
  physicalResist? = 0;
  necroticResist? = 0;
  energyResist? = 0;
  waterResist? = 0;
  fireResist? = 0;
  iceResist? = 0;
  poisonResist? = 0;
  diseaseResist? = 0;

  actionSpeed? = 1;
  damageFactor? = 1;

  effect?: ItemEffect;
}

export type MonsterClass = 'Undead' | 'Beast' | 'Humanoid' | 'Dragon';

export type StatName =
  'str' | 'dex' | 'agi' | 'int' | 'wis' | 'wil' | 'luk' | 'cha' | 'con'
  | 'move' | 'hpregen' | 'mpregen' | 'hp' | 'mp'
  | 'armorClass' | 'accuracy' | 'offense' | 'defense' | 'weaponArmorClass' | 'weaponDamageRolls' | 'mitigation'
  | 'stealth' | 'perception'
  | 'magicalDamageBoost' | 'physicalDamageBoost' | 'healingBoost' | 'physicalDamageReflect' | 'magicalDamageReflect'
  | 'magicalResist' | 'physicalResist' | 'necroticResist' | 'energyResist' | 'waterResist' | 'fireResist' | 'iceResist'
  | 'poisonResist' | 'diseaseResist'
  | 'actionSpeed' | 'damageFactor';

export const MaxSizes = {
  Belt: 5,
  Sack: 25,
  Buyback: 5
};

export const AllNormalGearSlots = [
  'rightHand', 'leftHand', 'gear.Armor', 'gear.Robe1', 'gear.Robe2', 'gear.Ring1', 'gear.Ring2',
  'gear.Head', 'gear.Neck', 'gear.Waist', 'gear.Wrists', 'gear.Hands', 'gear.Feet', 'gear.Ear'
];

export type Hostility = 'Never' | 'OnHit' | 'Faction' | 'Always';

export enum SpellLearned {
  FromFate = -2,
  FromItem = -1,
  Unlearned = 0,
  FromTraits = 1
}

export interface ICharacter {
  name: string;
  agro: any;
  uuid: string;
  hp: RestrictedNumber;
  mp: RestrictedNumber;
  exp: number;
  axp: number;
  currency: any;

  currentGold: number;

  baseStats: Stats;
  sumStats: Stats;
  allSkills: Skills;

  allegiance: Allegiance;
  sex: Sex;
  dir: Direction;

  x: number;
  y: number;
  map: string;

  level: number;
  highestLevel: number;

  skillOnKill: number;

  baseClass: CharacterClass;
  monsterClass?: MonsterClass;

  sack: IContainer;
  belt: IContainer;
  pouch: IContainer;

  effects: { [key: string]: IEffect };
  gear: { [key: string]: IItem };

  leftHand: IItem;
  rightHand: IItem;
  potionHand: IItem;

  swimLevel: number;
  aquaticOnly: boolean;
  avoidWater: boolean;
  combatTicks: number;

  sprite: number;
  alignment: Alignment;
  allegianceReputation: { [key: string]: number };
  affilitation?: string;

  fov: any;

  $$map: any;
  $$deathTicks: number;
  $$room: IGameWorld;
  $$corpseRef: IItem;
  $$ai: any;
  $$flaggedSkills: string[];
  $$interceptor: ICharacter;
  $$pets: ICharacter[];
  $$owner: ICharacter;

  effectsList: IEffect[];
  dispellableEffects: IEffect[];
  augmentEffectsList: AugmentSpellEffect[];
  onHitEffectsList: OnHitEffect[];
  attributeEffectsList: AttributeEffect[];

  isInCombat: boolean;
  sackSize: number;
  beltSize: number;
  isNaturalResource: boolean;
  isOreVein: boolean;

  getTotalStat(stat: StatName): number;
  getBaseStat(stat: StatName): number;
  setBaseStat(stat: StatName, value: number): void;
  gainBaseStat(stat: StatName, value: number): void;
  loseBaseStat(stat: StatName, value: number): void;

  initAI(): void;
  initHpMp(): void;
  initSack(): void;
  initBelt(): void;
  initPouch(): void;
  initHands(): void;
  initGear(): void;
  initEffects(): void;

  init(): void;
  initServer(): void;

  toSaveObject(): any;

  sellValue(item: IItem): number;

  hasEmptyHand(): boolean;
  canGetBonusFromItemInHand(item: IItem): boolean;
  itemCheck(item: IItem): void;
  determineItemType(itemClass: string): string;
  setLeftHand(item: IItem, recalc?: boolean): void;
  setRightHand(item: IItem, recalc?: boolean): void;
  setPotionHand(item: IItem): void;
  equip(item: IItem): void;
  _equip(item: IItem): void;
  unequip(slot: string): void;
  canEquip(item: IItem): boolean;
  addItemToSack(item: IItem): boolean;
  addItemToBelt(item: IItem): boolean;
  addItemToPouch(item: IItem): boolean;
  hasHeldItem(item: string, hand: 'left'|'right'): boolean;
  hasHeldItems(item1: string, item2: string): boolean;
  useItem(source: 'leftHand'|'rightHand'|'potionHand', fromApply: boolean): void;
  doSuccor(succorInfo: any): void;

  earnGold(gold: number, reason?: string): void;
  spendGold(gold: number, reason?: string): void;
  hasCurrency(currency: Currency, amt: number): boolean;
  earnCurrency(currency: Currency, amt: number, on?: string): void;
  spendCurrency(currency: Currency, amt: number, on?: string): void;

  getDirBasedOnDiff(x: number, y: number): string;
  setDirBasedOnXYDiff(x: number, y: number): void;
  setDirRelativeTo(char: ICharacter): void;
  getXYFromDir(dir: Direction): { x: number, y: number };

  takeSequenceOfSteps(steps: any[], isChasing: boolean, recalculateFOV: boolean): boolean;
  isValidStep(step): boolean;

  isDead(): boolean;
  isPlayer(): boolean;
  canDie(): boolean;

  kill(dead: ICharacter, opts: any): void;
  die(killer?: ICharacter, silent?: boolean): void;
  revive(): void;
  restore(force: boolean): void;

  canSee(xOffset: number, yOffset: number): boolean;

  changeBaseClass(newClass: CharacterClass): void;

  recalculateStats(): void;
  tryToCastEquippedEffects(): void;
  tickEffects(): void;
  clearAllEffects(): void;
  clearEffects(): void;
  applyEffect(effect: IEffect): void;
  unapplyEffect(effect: IEffect, force?: boolean): void;
  hasEffect(effectName: string): IEffect;

  gainExp(xp: number): void;
  gainAxp(axp: number): void;
  gainExpFromKills(xp: number, axp: number): void;
  gainSkillFromKills(skill: number): void;
  tryLevelUp(maxLevel: number): void;
  gainLevelStats(): void;
  calcLevelXP(level: number): number;

  loseExpOrSkill(opts): void;

  isValidSkill(type: string);
  flagSkill(skills: string[]): void;
  gainCurrentSkills(skillGained: number): void;
  gainSkill(type: string, skillGained: number, bypassRoomCap?: boolean): void;
  _gainSkill(type: string, skillGained: number): void;
  setSkill(type: string, skill: number): void;
  addSkillLevels(type: string, levels: number): void;
  calcSkillLevel(type: string): number;
  calcBaseSkillLevel(type: string): number;

  getBonusUsableSkillsBasedOnOwner(): string[];
  killAllPets(): void;

  youDontSeeThatPerson(uuid: string): void;

  receiveMessage(from: ICharacter, message: string|any): void;
  sendClientMessage(message: string|any, shouldQueue?: boolean): void;
  sendClientMessageToRadius(message: string|any, radius: number, except: string[], useSight: boolean, formatArgs: string[], shouldQueue: boolean): void;
  sendClientMessageFromNPC(npc: ICharacter, message: string): void;
  sendClientMessageBatch(): void;

  tick(): void;
  isUnableToAct(): boolean;
  setCombatTicks(ticks: number): void;

  distFrom(point, vector?): number;

  resetAgro(full: boolean): void;
  addAgroOverTop(char: ICharacter, value: number): void;
  addAgro(char: ICharacter, value: number): void;
  removeAgro(char: ICharacter): void;

  changeRep(allegiance: Allegiance, modifier: number): void;

  stealthLevel(): number;
  hidePenalty(): number;
  perceptionLevel(): number;
  isHidden(): boolean;
  canSeeThroughStealthOf(char: ICharacter): boolean;

  getBaseTraitLevel(trait: string): number;
  getTraitLevel(trait: string): number;
  getTraitLevelAndUsageModifier(trait: string): number;

  changeAlignment(alignment: Alignment): void;

  isHostileTo(faction: Allegiance): boolean;
  isFriendlyTo(faction: Allegiance): boolean;
  isNeutralTo(faction: Allegiance): boolean;
  allegianceAlignmentString(faction: Allegiance): string;
}

export interface IPlayer extends ICharacter {
  _id?: any;
  createdAt: number;
  username: string;
  charSlot: number;
  z: number;

  inGame: boolean;
  buyback: IItem[];

  $$doNotSave: boolean;
  $$actionQueue: any;
  $$lastDesc: string;
  $$lastRegion: string;
  $$swimElement: string;
  $$locker: any;
  $$banks: any;

  bgmSetting: 'town' | 'dungeon' | 'wilderness';

  respawnPoint: { x: number, y: number, map: string };

  partyName: string;

  hungerTicks: number;
  $$isAccessingLocker: boolean;
  $$areHandsBusy: boolean;
  $$tradeskillBusy: boolean;
  $$ready: boolean;
  $$account: IAccount;
  $$spawnerSteps: number;
  $$spawnerRegionId: string|number;
  $$statistics: Statistics;

  tradeSkillContainers: { alchemy?: IAlchemyContainer, spellforging?: ISpellforgingContainer, metalworking?: IMetalworkingContainer };

  daily: { quest: any, item: any };

  party: any;
  skillTree: any;

  allTraitLevels: any;

  gainingAP: boolean;

  initTradeskills(): void;
  initBuyback(): void;

  saveSkillTree(): void;
  unlearnSpell(skillName: string): void;
  unlearnAll(): void;
  learnSpell(skillName: string, conditional?: SpellLearned): boolean;
  hasLearned(skillName: string): boolean;

  teleportToRespawnPoint(): void;
  getBaseSprite(): number;

  buybackSize(): number;
  fixBuyback(): void;
  buyItemBack(slot: number): void;
  sellItem(item: IItem): number;

  sendQuestMessage(quest: any, message: string): void;
  startQuest(quest: any): void;
  hasQuest(quest: any): boolean;
  hasQuestName(name: string): boolean;
  hasPermanentCompletionFor(name: string): boolean;
  setQuestData(quest: any, data: any): void;
  getQuestData(quest: any): any;
  cancelNonPermanentQuest(quest: any): void;
  checkForQuestUpdates(questOpts): void;
  permanentlyCompleteQuest(questName: string): void;
  completeQuest(quest: any): void;
  removeQuest(quest: any): void;

  canTakeItem(item: IItem): boolean;

  decreaseTraitLevel(trait: string, levelsLost: number): void;
  increaseTraitLevel(trait: string, levelsGained: number, reqBaseClass?: string, extra?: any): void;
  isTraitInEffect(trait: string): boolean;
  isTraitActive(trait: string): boolean;

  queueAction(opts: { command: string, args: string }): void;

  canBuyDailyItem(item: IItem): boolean;
  canDoDailyQuest(key: string): boolean;
  completeDailyQuest(key: string): void;
  buyDailyItem(item: IItem): void;

  setHandsBusy(): void;
  setHandsFree(): void;
  setTradeskillBusy(): void;
  setTradeskillFree(): void;
}

export interface INPC extends ICharacter {
  npcId: string;
  uuid: string;

  hostility: Hostility;

  vendorItems?: IItem[];
  $$vendorCurrency: Currency;

  classTrain?: string;
  trainSkills?: string[];
  maxSkillTrain?: number;
  maxLevelUpLevel?: number;

  bankId?: string;
  branchId?: string;

  alchOz?: number;
  alchCost?: number;

  costPerThousand?: number;
  repairsUpToCondition?: number;

  peddleDesc?: string;
  peddleItem?: string;
  peddleCost?: number;

  hpTier?: number;
  mpTier?: number;

  copyDrops: any[];
  drops: any[];
  dropPool: any;
  giveXp: { min: number, max: number };
  repMod: any[];

  traitLevels: any;

  usableSkills: string[];

  leashMessage: string;
  sfx: string;
  sfxMaxChance: number;
  spawnMessage: string;
  combatMessages: string[];

  onlyVisibleTo?: string;

  $$skillRoller: any;
  $$pathDisrupted: { x: number, y: number };

  $$shouldStrip: boolean;
  $$stripRadius: number;
  $$stripOnSpawner: boolean;
  $$stripX: number;
  $$stripY: number;
  $$shouldEatTier: number;

  $$lastResponse: string;
  $$following: boolean;
  $$hadRightHandAtSpawn: boolean;

  $$stanceCooldown: number;

  noCorpseDrop?: boolean;
  noItemDrop?: boolean;
  dropsCorpse: boolean;

  script: string;
  parser: any;
  spawner?: any;
  path?: any[];

  setPath(path: string): void;

  sendLeashMessage(): void;
  sendSpawnMessage(): void;

  registerAttackDamage(char: ICharacter, attack: string, damage: number): void;
  getAttackDamage(char: ICharacter, attack: string): void;
  registerZeroTimes(char: ICharacter, attack: string, overrideValue?: boolean): void;
  getZeroTimes(char: ICharacter, attack: string): number;
}
