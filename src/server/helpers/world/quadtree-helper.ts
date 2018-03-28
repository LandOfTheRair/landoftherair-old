
import * as RBush from 'rbush';
import { NPC } from '../../../shared/models/npc';
import { Player } from '../../../shared/models/player';
import { Character } from '../../../shared/models/character';

export class QuadtreeHelper {

  private playerBush;
  private npcBush;

  public get playerCount(): number {
    return this.players.length;
  }

  public get npcCount(): number {
    return this.npcs.length;
  }

  public get players(): any[] {
    return this.playerBush.all();
  }

  public get npcs(): any[] {
    return this.npcBush.all();
  }

  constructor() {
    this.playerBush = RBush();
    this.npcBush = RBush();
  }

  // INSERT
  private _quadtreeInsert(bush: any, data: any) {
    if(!data.uuid) throw new Error(`Error: ${JSON.stringify(data)} is being inserted with no uuid!`);
    bush.insert(data);
  }

  npcQuadtreeInsert(npc: NPC): void {
    this._quadtreeInsert(this.npcBush, {
      minX: npc.x,
      minY: npc.y,
      maxX: npc.x,
      maxY: npc.y,
      uuid: npc.uuid
    });
  }

  playerQuadtreeInsert(player: Player): void {
    this._quadtreeInsert(this.playerBush, {
      minX: player.x,
      minY: player.y,
      maxX: player.x,
      maxY: player.y,
      uuid: player.uuid
    });
  }

  // REMOVE
  private _quadtreeRemove(bush: any, char: Character, oldPos: { x: number, y: number }): void {
    const oldPosRange = {
      minX: oldPos.x,
      minY: oldPos.y,
      maxX: oldPos.x,
      maxY: oldPos.y
    };

    bush.remove(oldPosRange, (me, treeItem) => {
      return char.uuid === treeItem.uuid;
    });
  }

  npcQuadtreeRemove(npc: NPC, oldPos: { x: number, y: number }): void {
    this._quadtreeRemove(this.npcBush, npc, oldPos);
  }

  playerQuadtreeRemove(player: Player, oldPos: { x: number, y: number }): void {
    this._quadtreeRemove(this.playerBush, player, oldPos);
  }

  // SEARCH
  private _quadtreeSearch(bush: any, pos: { x: number, y: number }, radius: number): any[] {
    return bush.search({
      minX: pos.x - radius,
      minY: pos.y - radius,
      maxX: pos.x + radius,
      maxY: pos.y + radius
    });
  }

  npcQuadtreeSearch(pos: { x: number, y: number }, radius: number): any[] {
    return this._quadtreeSearch(this.npcBush, pos, radius);
  }

  playerQuadtreeSearch(pos: { x: number, y: number }, radius: number): any[] {
    return this._quadtreeSearch(this.playerBush, pos, radius);
  }
}
