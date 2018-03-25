
import * as RBush from 'rbush';
import { NPC } from '../../../shared/models/npc';
import { Player } from '../../../shared/models/player';
import { Character } from '../../../shared/models/character';

export class QuadtreeHelper {

  private static playerBush;
  private static npcBush;


  static init() {
    QuadtreeHelper.playerBush = RBush();
    QuadtreeHelper.npcBush = RBush();
  }

  // INSERT
  private static _quadtreeInsert(bush: any, data: any) {
    bush.insert(data);
  }

  static npcQuadtreeInsert(npc: NPC): void {
    QuadtreeHelper._quadtreeInsert(QuadtreeHelper.npcBush, {
      minX: npc.x,
      minY: npc.y,
      maxX: npc.x,
      maxY: npc.y,
      uuid: npc.uuid
    });
  }

  static playerQuadtreeInsert(player: Player): void {
    QuadtreeHelper._quadtreeInsert(QuadtreeHelper.playerBush, {
      minX: player.x,
      minY: player.y,
      maxX: player.x,
      maxY: player.y,
      uuid: player.uuid
    });
  }

  // REMOVE
  private static _quadtreeRemove(bush: any, char: Character, oldPos: any = {}): void {
    const oldPosRange = {
      minX: oldPos.x || char.x,
      minY: oldPos.y || char.y,
      maxX: oldPos.x || char.x,
      maxY: oldPos.y || char.y,
      uuid: oldPos.uuid || char.uuid
    };

    bush.remove(oldPosRange, (me, treeItem) => {
      return me.uuid === treeItem.uuid;
    });
  }

  static npcQuadtreeRemove(npc: NPC, oldPos: any = {}): void {
    QuadtreeHelper._quadtreeRemove(QuadtreeHelper.npcBush, npc, oldPos);
  }

  static playerQuadtreeRemove(player: Player, oldPos: any = {}): void {
    QuadtreeHelper._quadtreeRemove(QuadtreeHelper.playerBush, player, oldPos);
  }

  // SEARCH
  private static _quadtreeSearch(bush: any, pos: { x: number, y: number }, radius: number): any[] {
    return bush.search({
      minX: pos.x - radius,
      minY: pos.y - radius,
      maxX: pos.x + radius,
      maxY: pos.y + radius
    });
  }

  static npcQuadtreeSearch(pos: { x: number, y: number }, radius: number): any[] {
    return QuadtreeHelper._quadtreeSearch(QuadtreeHelper.npcBush, pos, radius);
  }

  static playerQuadtreeSearch(pos: { x: number, y: number }, radius: number): any[] {
    return QuadtreeHelper._quadtreeSearch(QuadtreeHelper.playerBush, pos, radius);
  }
}
