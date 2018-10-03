
import { capitalize } from 'lodash';

import { Skill } from '../../../base/Skill';
import { CommandExecutor } from '../../../helpers/command-executor';
import { Player } from '../../../../shared/models/player';

export class Sheathe extends Skill {

  public name = ['~sheathe', 'sheathe'];
  public format = 'Hand';

  requiresLearn = false;

  execute(user: Player, { args, room, gameState }) {

    if(!args) return false;

    const [handCheck] = args.split(' ');

    const hand = handCheck.toLowerCase();
    if(hand !== 'left' && hand !== 'right') return false;

    CommandExecutor.executeCommand(user, `~${capitalize(hand).substring(0, 1)}tB`, {room, gameState });
  }

}
