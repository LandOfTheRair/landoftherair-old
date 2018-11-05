import { ICharacter, INPC, IPlayer } from './character';
import { IItem } from './item';

export enum TilesWithNoFOVUpdate {
  Empty = 0,
  Air = 2386
}

export interface IGameState {
  isDisposing: boolean;

  map: any;
  mapName: string;
  mapData: any;
  environmentalObjects: any;
  formattedMap: any;

  mapNPCs: any;
  trimmedNPCs: any;

  groundItems: any;
  simpleGroundItems: any;

  fov: any;

  maxSkill: number;
  allPlayers: IPlayer[];

  tick(): void;
  tickPlayers(): void;
  resetPlayerHash(): void;

  isSuccorRestricted(player: IPlayer): boolean;
  isTeleportRestricted(player: IPlayer): boolean;
  getSuccorRegion(player: ICharacter): string;

  addNPC(npc: INPC): void;
  syncNPC(npc: INPC): void;
  findNPC(uuid: string): INPC;
  findNPCByName(name: string): INPC;
  removeNPC(npc: INPC): void;
  updateNPCVolatile(npc: INPC): void;

  addPlayer(player: IPlayer, clientId: string): void;
  findPlayer(username: string): IPlayer;
  findCharacter(uuid: string): ICharacter;
  findPlayerByClientId(id: string): IPlayer;
  removePlayer(clientId: string): void;

  updateNPCInQuadtree(char: INPC, oldPos: any): void;
  updatePlayerInQuadtree(char: IPlayer, oldPos: any): void;
  getAllNPCsFromQuadtrees(char: ICharacter, radius: number): ICharacter[];

  addInteractable(obj: any): void;
  getInteractable(x: number, y: number, useOffset: boolean, typeFilter?: string): any;
  getInteractableByName(name: string): any;
  getDecorByName(name: string): any;
  removeInteractable(obj: any): void;
  getInteractableOrDenseObject(x: number, y: number): any;
  checkIfDenseObject(x: number, y: number): boolean;
  checkIfActualWall(x: number, y: number, shouldAirCountForWall?: boolean): boolean;
  checkIfDenseWall(x: number, y: number, shouldAirCountForWall?: boolean): boolean;

  checkIfCanPutDarknessAt(x: number, y: number): boolean;
  isDarkAt(x: number, y: number): boolean;
  addPermanentDarkness(x: number, y: number, radius: number): void;
  addDarkness(x: number, y: number, radius: number, timestamp: number): void;
  removeDarkness(x: number, y: number, radius: number, timestamp: number, force?: boolean, lightSeconds?: number): void;

  resetFOV(player: IPlayer): void;
  calculateFOV(char: ICharacter): void;

  getAllPlayersInRange(ref: { x: number, y: number }, radius: number): IPlayer[];
  getPlayersInRange(ref: ICharacter, radius: number, except?: string[], useSight?: boolean): ICharacter[];
  getAllInRangeRaw(ref: { x: number, y: number }, radius: number, except?: string[]): ICharacter[];
  getAllInRange(ref: ICharacter, radius: number, except?: string[], useSight?: boolean): ICharacter[];
  getAllHostilesInRange(ref: ICharacter, radius: number): ICharacter[];
  getAllAlliesInRange(ref: ICharacter, radius: number): ICharacter[];

  getPossibleTargetsFor(me: INPC, radius: number): ICharacter[];
  isInRegion(loc: { x: number, y: number }, reg: { x: number, y: number }): boolean;

  resetPlayerStatus(player: IPlayer, ignoreMessages?: boolean): void;

  toggleDoor(door, forceSet?: boolean): void;

  addItemToGround(loc: { x: number, y: number }, item: IItem): IItem;
  removeItemFromGround(item: IItem): void;
  setGround(ground: any): void;

  simplifyItem(item: IItem): any;

  serializableGroundItems(): any;
  getGroundItems(x: number, y: number): any;
  findChest(x: number, y: number): any;
}
