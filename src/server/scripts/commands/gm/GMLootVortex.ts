
import { Command } from '../../../base/Command';
import { Player } from '../../../../shared/models/player';
import { Vortex } from '../../../effects/misc/Vortex';

export class GMLootVortex extends Command {

  public name = '@lootvortex';
  public format = 'Radius';

  async execute(player: Player, { args }) {
    if(!player.$$room.subscriptionHelper.isGM(player)) return;

    let radius = args ? +args : 1;
    if(isNaN(radius)) radius = 1;

    const vortex = new Vortex({ potency: radius });
    vortex.cast(player, player);
  }
}
