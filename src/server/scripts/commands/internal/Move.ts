
import { find } from 'lodash';

import { Command } from '../../../base/Command';
import { Player } from '../../../../models/player';
import { MapLayer } from '../../../../models/gamestate';

export class Move extends Command {

  public name = '~move';

  execute(player: Player, { room, client, gameState, x, y }) {
    x = Math.max(Math.min(x, player.stats.move), -player.stats.move);
    y = Math.max(Math.min(y, player.stats.move), -player.stats.move);

    const checkX = Math.abs(x);
    const checkY = Math.abs(y);

    const denseTiles = gameState.map.layers[MapLayer.Walls].data;
    const maxTilesMoved = Math.max(checkX, checkY);
    const steps = Array(maxTilesMoved).fill(null);

    let tempX = x;
    let tempY = y;

    for(let curStep = 0; curStep < maxTilesMoved; curStep++) {

      const step = { x: 0, y: 0 };

      if(tempX < 0) {
        step.x = -1;
        tempX++;
      } else if(tempX > 0) {
        step.x = 1;
        tempX--;
      }

      if(tempY < 0) {
        step.y = -1;
        tempY++;
      } else if(tempY > 0) {
        step.y = 1;
        tempY--;
      }

      steps[curStep] = step;
    }

    const reverseSteps = steps.reverse();
    const denseObjects: any[] = gameState.map.layers[MapLayer.DenseDecor].objects;
    const interactables = gameState.map.layers[MapLayer.Interactables].objects;

    const denseCheck = denseObjects.concat(interactables);

    const getNumStepsSuccessful = (trySteps) => {
      for(var i = 0; i < trySteps.length; i++) {
        const step = trySteps[i];
        const nextTileLoc = ((player.y + step.y) * gameState.map.width) + (player.x + step.x);
        const nextTile = denseTiles[nextTileLoc];

        if(nextTile === 0) {
          const object = find(denseCheck, { x: (player.x + step.x)*64, y: (player.y + step.y + 1)*64 });
          if(object && object.density) {
            break;
          }
        } else {
          break;
        }
      }

      return i;
    };

    const normalStepsTaken = getNumStepsSuccessful(steps);
    const reverseStepsTaken = getNumStepsSuccessful(reverseSteps);

    const finalSteps = normalStepsTaken > reverseStepsTaken ? steps : reverseSteps;

    player.takeSequenceOfSteps(finalSteps);
    player.setDirBasedOnXYDiff(x, y);

    gameState.resetPlayerStatus(player);
  }

}
