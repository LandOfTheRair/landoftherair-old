
import { Command } from '../../../base/Command';
import { Player } from '../../../../shared/models/player';
import { MessageHelper } from '../../../helpers/world/message-helper';

export class Prod extends Command {

  public name = 'prod';
  public format = 'Target?';

  async execute(player: Player, { args }) {
    const possTargets = MessageHelper.getPossibleMessageTargets(player, args);

    if(possTargets && possTargets[0]) {
      const target = possTargets[0];

      player.sendClientMessage(`You prod ${target.name}!`);
      target.sendClientMessage(`${player.name} prods you!`);
      player.sendClientMessageToRadius(`${player.name} prods ${target.name}!`, 4, [player.uuid, target.uuid]);
      return;
    }

    player.sendClientMessage('You prod the air!');
    player.sendClientMessageToRadius(`${player.name} prods the air!`, 4, [player.uuid]);

  }
}
