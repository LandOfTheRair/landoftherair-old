
import { startsWith } from 'lodash';

import { Command } from '../../../base/Command';
import { Player } from '../../../../models/player';

export class Talk extends Command {

  public name = '~talk';

  execute(player: Player, { room, client, gameState, args }) {
    const argArr = args.split(',');
    argArr[1] = argArr[1].trim();
    const [findStr, message] = argArr;

    const possTargets = room.getPossibleMessageTargets(player, findStr);
    const target = possTargets[0];
    if(!target) return room.sendClientLogMessage(client, 'You do not see that person.');

    target.receiveMessage(room, client, player, message);
  }

}
