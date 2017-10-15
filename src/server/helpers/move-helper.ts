
import { Character, SkillClassNames } from '../../shared/models/character';
import { MapLayer } from '../../shared/models/maplayer';
import { find } from 'lodash';

import * as Pathfinder from 'pathfinding';

export class MoveHelper {

  static tryToOpenDoor(player: Character, door, { gameState }): boolean {
    door.properties = door.properties || {};
    const { requireLockpick, skillRequired, requireHeld } = door.properties;

    if(!door.isOpen
      && (requireLockpick || requireHeld)) {

      let shouldOpen = false;

      if(requireHeld
        && player.hasHeldItem(door.properties.requireHeld)) shouldOpen = true;

      if(requireLockpick
        && skillRequired
        && player.baseClass === 'Thief'
        && player.hasHeldItem('Lockpick', 'right')) {

        const playerSkill = player.calcSkillLevel(SkillClassNames.Thievery);

        if(playerSkill < skillRequired) {
          player.sendClientMessage('You are not skilled enough to pick this lock.');
          return false;
        }

        player.sendClientMessage('You successfully picked the lock!');
        player.setRightHand(null);

        shouldOpen = true;
      }

      if(!shouldOpen) {
        player.sendClientMessage('The door is locked.');
        return false;
      }
    }

    player.sendClientMessage(door.isOpen ? 'You close the door.' : 'You open the door.');
    gameState.toggleDoor(door);

    let { x, y } = door;

    x /= 64;
    y /= 64;

    gameState.getPlayersInRange({ x, y }, 3).forEach(p => gameState.calculateFOV(p));
    return true;
  }

  static move(player: Character, { room, gameState, x, y }) {

    const moveRate = player.getBaseStat('move');
    x = Math.max(Math.min(x, 4), -4);
    y = Math.max(Math.min(y, 4), -4);

    // const checkX = Math.abs(x);
    // const checkY = Math.abs(y);

    const denseTiles = gameState.map.layers[MapLayer.Walls].data;
    const denseObjects: any[] = gameState.map.layers[MapLayer.DenseDecor].objects;
    const interactables = gameState.map.layers[MapLayer.Interactables].objects;
    const denseCheck = denseObjects.concat(interactables);

    const grid = new Pathfinder.Grid(9, 9);

    for(let gx = -4; gx <= 4; gx++) {
      for(let gy = -4; gy <= 4; gy++) {

        const nextTileLoc = ((player.y + gy) * gameState.map.width) + (player.x + gx);
        const nextTile = denseTiles[nextTileLoc];

        // dense tiles get set to false
        if(nextTile !== 0) {
          grid.setWalkableAt(gx + 4, gy + 4, false);

        // non-dense tiles get checked for objects
        } else {
          const object = find(denseCheck, { x: (player.x + gx) * 64, y: (player.y + gy + 1) * 64 });
          if(object && object.density && object.type !== 'Door') {
            grid.setWalkableAt(gx + 4, gy + 4, false);
          }
        }

      }
    }

    grid.setWalkableAt(x + 4, y + 4, true);

    /*
    visual grid of walkable tiles in view:

    console.log(grid.nodes.map(arr => {
      return arr.map(x => x.walkable ? 1 : 0);
    }));
    */

    const astar = new Pathfinder.AStarFinder({
      allowDiagonal: true,
      dontCrossCorners: false
    });

    const finalPath = astar.findPath(4, 4, 4 + x, 4 + y, grid);
    
    const steps = finalPath.map(([x, y], idx) => {
      if(idx === 0) return { x: 0, y: 0 };

      const [prevX, prevY] = finalPath[idx - 1];
      return { x: x - prevX, y: y - prevY };
    });

    // the first step is always our tile, we should ignore it.
    steps.shift();

    if(steps.length > moveRate) {
      steps.length = moveRate;
    }

    player.takeSequenceOfSteps(steps);
    player.setDirBasedOnXYDiff(x, y);

    gameState.resetPlayerStatus(player);

    const interactable = room.state.getInteractable(player.x, player.y);

    if(interactable) {
      this.handleInteractable(room, player, interactable);
    }
  }

  private static handleInteractable(room, player, obj) {
    switch(obj.type) {
      case 'Teleport': return this.handleTeleport(room, player, obj);
      case 'Locker':   return this.handleLocker(room, player, obj);
      case 'Trap':     return this.handleTrap(room, player, obj);
    }
  }

  private static handleTeleport(room, player, obj) {
    const { teleportX, teleportY, teleportMap, requireHeld } = obj.properties;
    if(requireHeld && !player.hasHeldItem(requireHeld)) return;
    room.teleport(player, { x: teleportX, y: teleportY, newMap: teleportMap });
    player.sendClientMessage('Your surroundings shift.');
  }

  private static handleLocker(room, player, obj) {
    const { lockerId } = obj.properties;
    room.openLocker(player, obj.name, lockerId);
  }

  private static handleTrap(room, player, obj) {
    room.state.removeInteractable(obj);
    room.castEffectFromTrap(player, obj);
    player.sendClientMessage('You\'ve activated a trap!');
  }
}
