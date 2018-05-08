
import { Command } from '../../../base/Command';
import { Player } from '../../../../shared/models/player';

export class GMLootVortex extends Command {

  public name = '@lootvortex';
  public format = 'Radius';

  async execute(player: Player, { args }) {
    if(!player.$$room.subscriptionHelper.isGM(player)) return;

    let radius = args ? +args : 1;
    if(isNaN(radius)) radius = 1;

    for(let x = player.x - radius; x < player.x + radius; x++) {
      for(let y = player.y - radius; y < player.y + radius; y++) {
        const items = player.$$room.state.getGroundItems(x, y);

        Object.keys(items).forEach(itemClass => {
          items[itemClass].forEach(item => {
            player.$$room.removeItemFromGround(item);
            player.$$room.addItemToGround(player, item);
          });
        });
      }
    }
  }
}
