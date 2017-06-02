
import { Command } from '../../base/Command';
import { Player } from '../../../models/player';

export class Move extends Command {

  public name = '~move';

  execute(client, player: Player, { map, x, y }) {
    x = Math.max(Math.min(x, player.stats.move), -player.stats.move);
    y = Math.max(Math.min(y, player.stats.move), -player.stats.move);

    const checkX = Math.abs(x);
    const checkY = Math.abs(y);

    const denseTiles = map.layers[4].data;
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

    const getNumStepsSuccessful = (trySteps) => {
      for(var i = 0; i < trySteps.length; i++) {
        const step = trySteps[i];
        const nextTileLoc = ((player.y + step.y) * map.width) + (player.x + step.x);
        const nextTile = denseTiles[nextTileLoc];

        if(nextTile !== 0) {
          break;
        }
      }

      return i;
    };

    const normalStepsTaken = getNumStepsSuccessful(steps);
    const reverseStepsTaken = getNumStepsSuccessful(reverseSteps);

    const finalSteps = normalStepsTaken > reverseStepsTaken ? steps : reverseSteps;

    finalSteps.forEach(step => {
      const nextTileLoc = ((player.y + step.y) * map.width) + (player.x + step.x);
      const nextTile = denseTiles[nextTileLoc];

      if(nextTile !== 0) {
       return;
      }

      player.x += step.x;
      player.y += step.y;
    });

    // console.log(steps);


    // player.x += x;
    // player.y += y;

    if(player.x < 0) player.x = 0;
    if(player.y < 0) player.y = 0;

    if(player.x > map.width)  player.x = map.width;
    if(player.y > map.height) player.y = map.height;

    if(checkX >= checkY) {
      if(x > 0) {
        player.dir = 'E';
      } else if(x < 0) {
        player.dir = 'W';
      }

    } else if(checkY > checkX) {
      if(y > 0) {
        player.dir = 'S';
      } else if(y < 0) {
        player.dir = 'N';
      }
    }
  }

}
