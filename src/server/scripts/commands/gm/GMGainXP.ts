
import { Command } from '../../../base/Command';
import { Player } from '../../../../shared/models/player';
import { ItemCreator } from '../../../helpers/item-creator';

export class GMGainXP extends Command {

  public name = '@xp';
  public format = 'XP';

  async execute(player: Player, { room, gameState, args }) {
    if(!player.isGM) return;

    const xpGain = +args;
    player.gainExp(xpGain);
  }
}
