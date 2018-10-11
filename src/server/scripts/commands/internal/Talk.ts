
import { startsWith } from 'lodash';

import { Command } from '../../../base/Command';
import { Player } from '../../../../shared/models/player';
import { MessageHelper } from '../../../helpers/world/message-helper';

export class Talk extends Command {

  public name = '~talk';

  execute(player: Player, { args }) {
    const argArr = args.split(',');

    if(argArr.length < 2) return;

    argArr[1] = argArr[1].trim();
    let [findStrAndName, message] = argArr;

    if(startsWith(findStrAndName, '~talk') || startsWith(findStrAndName, '~say')) {
      findStrAndName = findStrAndName.split(' ')[1].trim();
    }

    const possTargets = MessageHelper.getPossibleMessageTargets(player, findStrAndName);
    const target = possTargets[0];
    if(!target) return player.youDontSeeThatPerson(args);

    message = MessageHelper.cleanMessage(message);
    target.receiveMessage(player, message);
  }

}
