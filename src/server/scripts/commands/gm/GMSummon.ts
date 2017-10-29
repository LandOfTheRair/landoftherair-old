
import { Command } from '../../../base/Command';
import { Player } from '../../../../shared/models/player';
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
      room.setPlayerXY(checkTarget, player.x, player.y);
      checkTarget.z = player.z;
    });

  }
}
