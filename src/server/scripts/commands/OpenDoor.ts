
import { Command } from '../../base/Command';
import { Player } from '../../../models/player';
import { MapLayer } from '../../../models/gamestate';
import { find } from 'lodash';

export class OpenDoor extends Command {

  public name = 'open';
  public format = 'open DIR';

  execute(player: Player, { room, client, gameState, args }) {
    if(!args) return false;

    const map = gameState.map;
    const interactables = map.layers[MapLayer.Interactables].objects;
    const { x, y } = this.getXYFromDir(args);

    const targetX = (player.x + x);
    const targetY = (player.y + y + 1);

    const door = find(interactables, { x: targetX * 64, y: targetY * 64 });

    if(!door) {
      room.sendClientLogMessage(client, 'There is no door there.');
      return;
    }

    if(door.isOpen) {
      room.sendClientLogMessage(client, 'The door is already open.');
      return;
    }

    room.sendClientLogMessage(client, 'You open the door.');
    gameState.toggleDoor(door);

    // TODO make fov take doors into account
    // TODO update all nearby players fov
  }

}
