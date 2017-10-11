
import { Command } from '../../../base/Command';
import { Player } from '../../../../models/player';
import { MapLayer } from '../../../../models/maplayer';
import { find, includes } from 'lodash';
import { SkillClassNames } from '../../../../models/character';

export class OpenDoor extends Command {

  public name = ['open', 'close'];
  public format = 'DIR';

  execute(player: Player, { room, gameState, args }) {
    if(!args) return false;

    let { x, y } = player.getXYFromDir(args);

    if(includes(args, ' ')) {
      [x, y] = args.split(' ').map(z => +z);
    }

    const map = gameState.map;
    const interactables = map.layers[MapLayer.Interactables].objects;

    const targetX = (player.x + x);
    const targetY = (player.y + y + 1);

    const door = find(interactables, { x: targetX * 64, y: targetY * 64, type: 'Door' });

    if(!door) {
      player.sendClientMessage('There is no door there.');
      return;
    }

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
          return player.sendClientMessage('You are not skilled enough to pick this lock.');
        }

        player.sendClientMessage('You successfully picked the lock!');
        player.setRightHand(null);

        shouldOpen = true;
      }

      if(!shouldOpen) {
        return player.sendClientMessage('The door is locked.');
      }
    }

    player.sendClientMessage(door.isOpen ? 'You close the door.' : 'You open the door.');
    gameState.toggleDoor(door);

    gameState.getPlayersInRange({ x: targetX, y: targetY }, 3).forEach(p => gameState.calculateFOV(p));
  }

}
