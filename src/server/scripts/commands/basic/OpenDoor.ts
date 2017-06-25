
import { Command } from '../../../base/Command';
import { Player } from '../../../../models/player';
import { MapLayer } from '../../../../models/gamestate';
import { find, includes } from 'lodash';

export class OpenDoor extends Command {

  public name = ['open', 'close'];
  public format = 'DIR';

  execute(player: Player, { room, gameState, args }) {
    if(!args) return false;

    let { x, y } = player.getXYFromDir(args);

    if(includes(args, ' ')) {
      [x, y] = args.split(' ').map(x => +x);
    }

    const map = gameState.map;
    const interactables = map.layers[MapLayer.Interactables].objects;

    const targetX = (player.x + x);
    const targetY = (player.y + y + 1);

    const door = find(interactables, { x: targetX * 64, y: targetY * 64 });

    if(!door) {
      player.sendClientMessage('There is no door there.');
      return;
    }

    if(!door.isOpen
      && door.properties
      && door.properties.requireHeld
      && !player.hasHeldItem(door.properties.requireHeld)) return player.sendClientMessage('The door is locked.');

    player.sendClientMessage(door.isOpen ? 'You close the door.' : 'You open the door.');
    gameState.toggleDoor(door);

    gameState.getPlayersInRange(targetX, targetY, 3).forEach(p => gameState.calculateFOV(p));
  }

}
