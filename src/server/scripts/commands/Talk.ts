
import { Command } from '../../base/Command';
import { Player } from '../../../models/player';

export class Talk extends Command {

  public name = '~talk';

  execute(player: Player, { args }) {
    console.log(player, args);

    // TODO if npc not visible, say so
  }

}
