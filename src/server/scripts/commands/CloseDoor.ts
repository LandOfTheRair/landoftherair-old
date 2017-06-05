
import { Command } from '../../base/Command';
import { Player } from '../../../models/player';
import { MapLayer } from '../../../models/gamestate';
import { find } from 'lodash';

export class CloseDoor extends Command {

  public name = 'close';
  public format = 'close DIR';

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

    if(!door.isOpen) {
      room.sendClientLogMessage(client, 'The door is already closed.');
      return;
    }

    room.sendClientLogMessage(client, 'You close the door.');
    gameState.toggleDoor(door);

    // TODO update all nearby players fov
  }

}
