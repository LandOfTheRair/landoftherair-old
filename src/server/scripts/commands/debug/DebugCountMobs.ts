
import { Command } from '../../../base/Command';
import { Player } from '../../../../shared/models/player';

export class DebugCountMobs extends Command {

  public name = '~~mobs';

  execute(player: Player, { room }) {
    player.sendClientMessage(`Currently ${room.state._mapNPCs.length} NPCs and ${room.state.players.length} players in ${room.state.mapName}.`);
  }

}
