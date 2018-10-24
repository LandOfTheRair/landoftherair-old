
import { Command } from '../../../base/Command';
import { Player } from '../../../../shared/models/player';
import { SkillClassNames } from '../../../../shared/models/character';

export class GMTeleportTile extends Command {

  public name = '@teleporttile';
  public format = 'X Y Map';

  async execute(player: Player, { room, args }) {
    if(!player.$$room.subscriptionHelper.isGM(player)) return;

    const [x, y, map] = args.split(' ');
    if(!x || !y || !map) return;

    const teleInteractable = {
      x: player.x * 64,
      y: (player.y + 1) * 64,
      type: 'Teleport',
      gid: 1055,
      image: 'Decor',
      properties: {
        teleportX: +x,
        teleportY: +y,
        teleportMap: map,
        timestamp: Date.now()
      }
    };

    room.state.addInteractable(teleInteractable);
  }
}
