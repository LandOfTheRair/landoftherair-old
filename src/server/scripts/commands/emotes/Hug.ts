
import { Command } from '../../../base/Command';
import { Player } from '../../../../shared/models/player';
import { MessageHelper } from '../../../helpers/message-helper';

export class Hug extends Command {

  public name = 'hug';
  public format = 'Target?';

  async execute(player: Player, { room, gameState, args }) {
    const possTargets = MessageHelper.getPossibleMessageTargets(player, args);

    if(possTargets && possTargets[0]) {
      const target = possTargets[0];

      player.sendClientMessage(`You hug ${target.name}!`);
      target.sendClientMessage(`${player.name} hugs you!`);
      player.sendClientMessageToRadius(`${player.name} hugs ${target.name}!`, 4, [player.uuid, target.uuid]);
      player.removeAgro(target);
      return;
    }

    player.sendClientMessage('You hug the air!');
    player.sendClientMessageToRadius(`${player.name} hugs the air!`, 4, [player.uuid]);

  }
}
