
import { find } from 'lodash';

import { Command } from '../../../base/Command';
import { Player } from '../../../../shared/models/player';
import { MapLayer } from '../../../../shared/models/maplayer';

import { CommandExecutor } from '../../../helpers/command-executor';

export class Interact extends Command {

  public name = '~interact';

  execute(player: Player, { room, gameState, x, y }) {
    // can't interact from >1 tile away
    if(Math.abs(x) > 1 || Math.abs(y) > 1) return;

    const interactable = player.$$room.state.getInteractable(player.x + x, player.y + y);
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
