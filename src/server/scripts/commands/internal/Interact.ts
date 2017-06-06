
import { find } from 'lodash';

import { Command } from '../../../base/Command';
import { Player } from '../../../../models/player';
import { MapLayer } from '../../../../models/gamestate';

import { CommandExecutor } from '../../../helpers/command-executor';

export class Interact extends Command {

  public name = '~interact';

  execute(player: Player, { room, client, gameState, x, y }) {
    // can't interact from >1 tile away
    if(Math.abs(x) > 1 || Math.abs(y) > 1) return;

    const interactables = gameState.map.layers[MapLayer.Interactables].objects;
    const interactable = find(interactables, { x: (player.x + x)*64, y: (player.y + y + 1)*64 });

    if(!interactable) return;

    let cmdInfo = {};
    switch(interactable.type) {
      case 'Teleport': return this.doTeleport(room, client, player, interactable);
      case 'Door': cmdInfo = this.doDoor(gameState, interactable); break;
    }
    
    const { command, shouldContinue }: any = cmdInfo;
    const args = `${x} ${y}`;
    if(!command || !shouldContinue) return;

    CommandExecutor.executeCommand(player, command, { room, client, gameState, args });
  }

  private doDoor(gameState, door) {
    const gameStateDoor = gameState.mapData.openDoors[door.id];
    return { command: 'open', shouldContinue: !gameStateDoor || (gameStateDoor && !gameStateDoor.isOpen) };
  }

  private doTeleport(room, client, player, obj) {
    const { teleportX, teleportY, teleportMap } = obj.properties;
    room.teleport(client, player, { x: teleportX, y: teleportY, newMap: teleportMap });
  }

}
