
import { Command } from '../../base/Command';
import { Player } from '../../../models/player';

export class Talk extends Command {

  public name = 'talk';

  execute(player: Player, { data }) {
    console.log(player, data);
  }

}
