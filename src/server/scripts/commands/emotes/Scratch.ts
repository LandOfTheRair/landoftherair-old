
import { Command } from '../../../base/Command';
import { Player } from '../../../../shared/models/player';
import { MessageHelper } from '../../../helpers/world/message-helper';

export class Scratch extends Command {

  public name = 'scratch';
  public format = 'Target?';

  async execute(player: Player, { args }) {
    const possTargets = MessageHelper.getPossibleMessageTargets(player, args);

    if(possTargets && possTargets[0]) {
      const target = possTargets[0];

      player.sendClientMessage(`You scratch ${target.name}!`);
      target.sendClientMessage(`${player.name} scratches you!`);
      player.sendClientMessageToRadius(`${player.name} scratches ${target.name}!`, 4, [player.uuid, target.uuid]);
      target.addAgro(player, 1);
      return;
    }

    player.sendClientMessage('You scratch yourself!');
    player.sendClientMessageToRadius(`${player.name} scratches theirself!`, 4, [player.uuid]);

  }
}
