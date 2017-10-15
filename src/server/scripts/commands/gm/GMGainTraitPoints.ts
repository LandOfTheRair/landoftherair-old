
import { Command } from '../../../base/Command';
import { Player } from '../../../../shared/models/player';
import { ItemCreator } from '../../../helpers/item-creator';

export class GMGainTraitPoints extends Command {

  public name = '@tp';
  public format = 'Amount';

  async execute(player: Player, { room, gameState, args }) {
    if(!player.isGM) return;

    const traitGain = +args;
    player.gainTraitPoints(traitGain);
  }
}
