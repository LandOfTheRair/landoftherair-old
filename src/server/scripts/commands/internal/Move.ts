
import { Command } from '../../../base/Command';
import { Player } from '../../../../shared/models/player';
import { MoveHelper } from '../../../helpers/character/move-helper';

export class Move extends Command {

  public name = '~move';

  execute(player: Player, { room, gameState, x, y }) {
    MoveHelper.move(player, { room, gameState, x, y });

    player.$$room.updatePos(player);
  }

}
