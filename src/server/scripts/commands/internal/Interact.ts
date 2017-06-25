
import { find } from 'lodash';

import { Command } from '../../../base/Command';
import { Player } from '../../../../models/player';
import { MapLayer } from '../../../../models/gamestate';

import { CommandExecutor } from '../../../helpers/command-executor';

export class Interact extends Command {

  public name = '~interact';

  execute(player: Player, { room, gameState, x, y }) {
    // can't interact from >1 tile away
    if(Math.abs(x) > 1 || Math.abs(y) > 1) return;

    const interactables = gameState.map.layers[MapLayer.Interactables].objects;
    const interactable = find(interactables, { x: (player.x + x)*64, y: (player.y + y + 1)*64 });

    if(!interactable) return;

    let cmdInfo = {};
    switch(interactable.type) {
      case 'Door': cmdInfo = this.doDoor(gameState, interactable); break;
    }

    const { command, shouldContinue, errorMessage }: any = cmdInfo;
    const args = `${x} ${y}`;
    if(!command || !shouldContinue) {
      if(errorMessage) player.sendClientMessage(errorMessage);
      return;
    }

    CommandExecutor.executeCommand(player, command, { room, gameState, args });
  }

  private doDoor( gameState, door) {
    const gameStateDoor = gameState.mapData.openDoors[door.id];
    const shouldContinue = !gameStateDoor || (gameStateDoor && !gameStateDoor.isOpen);

    return { command: 'open', shouldContinue };
  }

}
