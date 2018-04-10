
import { Command } from '../../../base/Command';
import { Player } from '../../../../shared/models/player';

export class SkillTree extends Command {

  public name = '~skilltree';
  public format = '';

  execute(player: Player) {
    player.$$room.updateSkillTree(player);
  }

}
