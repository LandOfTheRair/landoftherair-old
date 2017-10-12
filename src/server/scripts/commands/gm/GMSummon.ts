
import { Command } from '../../../base/Command';
import { Player } from '../../../../models/player';
import { ItemCreator } from '../../../helpers/item-creator';

export class GMSummon extends Command {

  public name = '@summon';
  public format = 'PlayerName';

  async execute(player: Player, { room, gameState, args }) {
    if(!player.isGM) return;

    const playerName = args;
    if(!playerName) return false;

    room.state.players.forEach(checkTarget => {
      if(!room.doesTargetMatchSearch(checkTarget, args)) return;
      checkTarget.x = player.x;
      checkTarget.y = player.y;

      room.state.calculateFOV(checkTarget);
    });

  }
}
