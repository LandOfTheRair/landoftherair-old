
import { Command } from '../../../base/Command';
import { Player } from '../../../../shared/models/player';

export class DebugCountItems extends Command {

  public name = '~~items';

  execute(player: Player, { room }) {

    player.sendClientMessage(`Currently ${room.groundItemCount} items on the ground in this world.`);
  }

}
