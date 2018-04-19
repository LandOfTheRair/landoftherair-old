
import { Command } from '../../../base/Command';
import { Player } from '../../../../shared/models/player';

export class GMGainTraitPoints extends Command {

  public name = '@tp';
  public format = 'Amount';

  async execute(player: Player, { args }) {
    if(!player.$$room.subscriptionHelper.isGM(player)) return;

    const traitGain = +args;
    player.skillTree.reset(player);
    player.skillTree.gainResetPoints(traitGain);
    player.skillTree.gainTraitPoints(traitGain);
  }
}
