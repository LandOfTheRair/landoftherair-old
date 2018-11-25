
import { Character } from '../../../shared/models/character';
import { MapLayer } from '../../../shared/models/maplayer';
import { isUndefined } from 'lodash';

import * as Pathfinder from 'pathfinding';
import { CombatHelper } from '../world/combat-helper';
import { HolidayHelper } from '../../../shared/helpers/holiday-helper';
import { Player } from '../../../shared/models/player';

export class MoveHelper {

  static move(player: Character, { room, gameState, x, y }, isChasing = false, recalculateSight = false): boolean {

    if(isUndefined(x) || isUndefined(y)) return;

    const moveRate = player.getTotalStat('move');
    x = Math.max(Math.min(x, 4), -4);
    y = Math.max(Math.min(y, 4), -4);

    if(moveRate <= 0) return;

    // const checkX = Math.abs(x);
    // const checkY = Math.abs(y);

    const denseTiles = gameState.map.layers[MapLayer.Walls].data;

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
          if(gameState.checkIfDenseObject(player.x + gx, player.y + gy)) {
            grid.setWalkableAt(gx + 4, gy + 4, false);
          }
        }

      }
    }

    grid.setWalkableAt(x + 4, y + 4, true);

    /*
    visual grid of walkable tiles in view:

    if(player.isPlayer()) {
      console.log(grid.nodes.map(arr => {
        return arr.map(x => x.walkable ? 1 : 0);
      }));
    }
    */

    const astar = new Pathfinder.AStarFinder({
      diagonalMovement: Pathfinder.DiagonalMovement.Always,
      // dontCrossCorners: false
    });

    const finalPath = astar.findPath(4, 4, 4 + x, 4 + y, grid);

    const steps = finalPath.map(([newX, newY], idx) => {
      if(idx === 0) return { x: 0, y: 0 };

      const [prevX, prevY] = finalPath[idx - 1];
      return { x: newX - prevX, y: newY - prevY };
    });

    // the first step is always our tile, we should ignore it.
    steps.shift();

    if(steps.length > moveRate) {
      steps.length = moveRate;
    }

    player.takeSequenceOfSteps(steps, isChasing, recalculateSight);
    player.setDirBasedOnXYDiff(x, y);

    if(player.isPlayer()) {
      gameState.resetPlayerStatus(player);

      const interactable = room.state.getInteractable(player.x, player.y);

      if(interactable) {
        this.handleInteractable(room, player, interactable);
      }

      const targ = <Player>player;
      if(!targ.$$spawnerSteps || targ.$$spawnerSteps <= 0) {
        targ.$$spawnerSteps = 4;
        MoveHelper.wakeUpNearbySpawners(targ);
      }

      targ.$$spawnerSteps--;
    }

    return true;
  }

  static wakeUpNearbySpawners(player: Player) {
    player.$$room.allSpawners.forEach(spawner => {
      if(!spawner.canActivateFor(player)) return;
      spawner.speedUp();
    });
  }

  private static handleInteractable(room, player, obj) {
    switch(obj.type) {
      case 'Fall':     return this.handleTeleport(room, player, obj, true);
      case 'Teleport': return this.handleTeleport(room, player, obj);
      case 'Locker':   return this.handleLocker(room, player, obj);
    }
  }

  private static handleTeleport(room, player, obj, isFall?: boolean) {
    const {
      teleportX, teleportY, teleportMap,
      requireHeld, requireQuest, requireQuestProgress, requireQuestComplete, requireParty, requireHoliday,
      damagePercent
    } = obj.properties;

    if(requireParty && !player.party) return player.sendClientMessage('You must gather your party before venturing forth.');
    if(requireHoliday && !HolidayHelper.isHoliday(requireHoliday)) return player.sendClientMessage(`That location is only seasonally open during "${requireHoliday}"!`);

    // check if player has a held item
    if(requireHeld && !player.hasHeldItem(requireHeld, 'left') && !player.hasHeldItem(requireHeld, 'right')) return;

    // check if player has a quest (and the corresponding quest progress, if necessary)
    if(requireQuest) {

      // if the player has permanent completion for it, they can always get through
      if(!player.hasPermanentCompletionFor(requireQuest)) {

        // but if not, we check if we need a certain quest progress
        if(requireQuestProgress) {
          const questData = player.getQuestData({ name: requireQuest });
          if(!questData || !questData[requireQuestProgress]) return;
        }

        // then we check if they have the quest
        if(!player.hasQuest({ name: requireQuest })) return;
      }
    }

    // check if player has completed quest
    if(requireQuestComplete) {
      if(!player.hasPermanentCompletionFor(requireQuestComplete)) return;
    }

    room.teleport(player, { x: teleportX, y: teleportY, newMap: teleportMap });

    MoveHelper.wakeUpNearbySpawners(player);

    if(isFall) {
      const hpLost = Math.floor(player.hp.maximum * ((damagePercent || 15) / 100));
      const damage = player.hasEffect('FleetOfFoot') ? 1 : hpLost;
      CombatHelper.dealOnesidedDamage(player, {
        damage,
        damageClass: 'physical',
        damageMessage: 'You have fallen!',
        suppressIfNegative: true,
        overrideSfx: 'combat-hit-melee'
      });
    } else {
      player.sendClientMessage('Your surroundings shift.');
    }
  }

  private static handleLocker(room, player, obj) {
    const { lockerId } = obj.properties;
    room.openLocker(player, obj.name, lockerId);
  }
}
