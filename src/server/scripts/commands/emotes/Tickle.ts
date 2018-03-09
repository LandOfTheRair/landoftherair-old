
import { Command } from '../../../base/Command';
import { Player } from '../../../../shared/models/player';
import { MessageHelper } from '../../../helpers/lobby/message-helper';

export class Tickle extends Command {

  public name = 'tickle';
  public format = 'Target?';

  async execute(player: Player, { args }) {
    const possTargets = MessageHelper.getPossibleMessageTargets(player, args);

    if(possTargets && possTargets[0]) {
      const target = possTargets[0];

      player.sendClientMessage(`You tickle ${target.name}!`);
      target.sendClientMessage(`${player.name} tickles you!`);
      player.sendClientMessageToRadius(`${player.name} tickles ${target.name}!`, 4, [player.uuid, target.uuid]);
      player.removeAgro(target);
      return;
    }

    player.sendClientMessage('You tickle the air!');
    player.sendClientMessageToRadius(`${player.name} tickles the air!`, 4, [player.uuid]);

  }
}
