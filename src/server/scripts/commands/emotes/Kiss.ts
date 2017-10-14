
import { Command } from '../../../base/Command';
import { Player } from '../../../../shared/models/player';

export class Kiss extends Command {

  public name = 'kiss';
  public format = 'Target?';

  async execute(player: Player, { room, gameState, args }) {
    const possTargets = room.getPossibleMessageTargets(player, args);

    if(possTargets && possTargets[0]) {
      const target = possTargets[0];

      player.sendClientMessage(`You kiss ${target.name}!`);
      target.sendClientMessage(`${player.name} kisses you!`);
      player.sendClientMessageToRadius(`${player.name} kisses ${target.name}!`, 4, [player.uuid, target.uuid]);
      player.removeAgro(target);
      return;
    }

    player.sendClientMessage('You kisses the air!');
    player.sendClientMessageToRadius(`${player.name} kisses the air!`, 4, [player.uuid]);

  }
}
