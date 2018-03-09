
import { Command } from '../../../base/Command';
import { Player } from '../../../../shared/models/player';
import { MessageHelper } from '../../../helpers/lobby/message-helper';

export class Disagree extends Command {

  public name = 'disagree';
  public format = 'Target?';

  async execute(player: Player, { args }) {
    const possTargets = MessageHelper.getPossibleMessageTargets(player, args);

    if(possTargets && possTargets[0]) {
      const target = possTargets[0];

      player.sendClientMessage(`You disagree with ${target.name}!`);
      target.sendClientMessage(`${player.name} disagrees with you!`);
      player.sendClientMessageToRadius(`${player.name} disagrees with ${target.name}!`, 4, [player.uuid, target.uuid]);
      return;
    }

    player.sendClientMessage('You disagree!');
    player.sendClientMessageToRadius(`${player.name} disagrees!`, 4, [player.uuid]);

  }
}
