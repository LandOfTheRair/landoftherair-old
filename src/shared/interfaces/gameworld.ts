import { Holiday } from './holiday';
import { ICharacter, INPC, IPlayer } from './character';
import { IItem } from './item';
import { IGameState } from './gamestate';

export type CombatEffect = 'hit-min' | 'hit-mid' | 'hit-max' | 'hit-magic' | 'hit-heal' | 'hit-buff'
  | 'block-dodge' | 'block-armor' | 'block-miss' | 'block-shield' | 'block-weapon' | 'block-offhand';

export type VisualEffect =
  'FIRE_FLOOR' | 'ICE_MIST' | 'WATER_POOL' | 'FIRE_MIST'
  | 'DUST_MIST' | 'SNOW_FLOOR' | 'ICE_STORM' | 'SLUDGE_FLOOR';

export const VISUAL_EFFECTS = {
  FIRE_FLOOR: 0,
  ICE_MIST: 1,
  WATER_POOL: 2,
  FIRE_MIST: 3,
  DUST_MIST: 4,
  SNOW_FLOOR: 5,
  ICE_STORM: 6,
  SLUDGE_FLOOR: 7
};

export interface IGameWorld {

  state: IGameState;

  partyManager: any;
  itemCreator: any;
  teleportHelper: any;
  skillTreeHelper: any;
  subscriptionHelper: any;
  npcLoader: any;
  lockerHelper: any;
  analyticsHelper: any;
  traitHelper: any;
  effectHelper: any;
  questHelper: any;

  groundItemCount: number;
  totalCreaturesInWorld: number;

  allSpawners: any[];

  mapWidth: number;
  mapHeight: number;
  mapRegion: string;
  mapName: string;
  mapHoliday: Holiday;
  maxSkill: number;

  disableCreatureSpawn: boolean;
  canSpawnCreatures: boolean;
  decayRateHours: number;
  decayChecksMinutes: number;
  maxItemsOnGround: number;
  mapRespawnPoint: { map: string, x: number, y: number };
  mapSubscriberOnly: boolean;
  script: string;
  canMemorize: boolean;
  exitPoint: { kickMap: string, kickX: number, kickY: number };
  canPartyAction: boolean;

  redisClient: any;

  sendRawData(player: IPlayer, data): void;
  flagClientReady(client, player: IPlayer): void;
  kickOut(player: IPlayer): void;
  saveGround(): Promise<any>;
  savePlayer(player: IPlayer): void;

  addNPC(npc: INPC): void;
  syncNPC(npc: INPC): void;
  removeNPC(npc: INPC): void;

  sendMessageToUsernames(usernames: string[], message: string|any): void;
  sendPlayerLogMessage(player: IPlayer, messageData, rootCharacter?: ICharacter): void;
  sendPlayerLogMessageBatch(player: IPlayer, messages: any[]): void;
  updateLogSettings(player: IPlayer, logSettings): void;
  formatClientLogMessage(data, rootCharacter?: ICharacter): void;
  sendClientLogMessage(client, messageData, rootCharacter?: ICharacter): void;

  showGroundWindow(player: IPlayer): void;
  showTrainerWindow(player: IPlayer, npc: INPC): void;
  showShopWindow(player: IPlayer, npc: INPC, items: IItem[]): void;
  showBankWindow(player: IPlayer, npc: INPC, banks: any): void;
  showAlchemyWindow(player: IPlayer, npc: INPC): void;
  showSpellforgingWindow(player: IPlayer, npc: INPC): void;
  showMetalworkingWindow(player: IPlayer, npc: INPC): void;
  showMarketBoard(player: IPlayer, npc: INPC): void;
  showLockerWindow(player: IPlayer, lockers, lockerId: string): void;

  openLocker(player: IPlayer, lockerName: string, lockerId: string): void;
  updateLocker(player: IPlayer, locker: any): void;

  openBank(player: IPlayer, npc: INPC): void;
  depositBankMoney(player: IPlayer, region: string, amount: number): void;
  withdrawBankMoney(player: IPlayer, region: string, amount: number): void;

  setPlayerXY(player: IPlayer, x: number, y: number): void;
  updatePos(player: ICharacter): void;
  updateFOV(player: IPlayer): void;
  teleport(player: IPlayer, opts: any): void;
  addItemToGround(ref, item: IItem): void;
  removeItemFromGround(item: IItem, fromGH: boolean);

  executeCommand(player: IPlayer, commandString: string, args: string): void;

  createDarkness(startX: number, startY: number, radius: number, durationInMinutes: number): void;
  removeDarkness(startX: number, startY: number, radius: number, lightSeconds: number): void

  createSpawner(opts, locRef): void;
  addSpawner(spawner): void;
  removeSpawner(spawner): void;

  dropCorpseItems(corpse: IItem, searcher?: IPlayer): void;
  dropChestItems(chest: any, searcher?: IPlayer): void;
  removeCorpse(corpseRef: IItem): void;

  drawEffect(player: ICharacter, center: any, effect: VisualEffect, radius: number): void;
  combatEffect(player: ICharacter, effect: CombatEffect, enemyUUID: string): void;

  resetMacros(player: IPlayer): void;
  updateSkillTree(player: IPlayer): void;

  calcAdjustedGoldGain(gold: number): number;
  calcAdjustedSkillGain(skill: number): number;
  calcAdjustedXPGain(xp: number): number;
  calcAdjustedAXPGain(axp: number): number;
  calcAdjustedItemFindGain(itemFind: number): number;
  calcAdjustedPartyXPGain(xp: number): number;

  getRandomStatInformation(): { numberOfRandomStatsForItems: number, randomStatMaxValue: number, randomStatChance: number };

  savePlayerPouch(player: IPlayer): Promise<any>;

  getInteractableByName(name: string): any;
  getSpawnerByName(name: string): any;

  addEvent(name: string, callback: Function): void;
  dispatchEvent(name: string, args: any): void;

  broadcastBoughtListing(listingId: string): void;

  givePlayerBasicAbilities(player: IPlayer): void;
}
