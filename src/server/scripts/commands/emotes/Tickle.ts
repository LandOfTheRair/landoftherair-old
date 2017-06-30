
import { Command } from '../../../base/Command';
import { Player } from '../../../../models/player';

export class Tickle extends Command {

  public name = 'tickle';
  public format = 'Target?';

  async execute(player: Player, { room, gameState, args }) {
    const possTargets = room.getPossibleMessageTargets(player, args);

    if(possTargets && possTargets[0]) {
      const target = possTargets[0];

      player.sendClientMessage(`You tickle ${target.name}!`);
      target.sendClientMessage(`${player.name} tickles you!`);
      player.sendClientMessageToRadius(`${player.name} tickles ${target.name}!`, 4, [player.uuid, target.uuid]);
      player.removeAgro(target);
      return;
    }

    player.sendClientMessage('You tickles the air!');
    player.sendClientMessageToRadius(`${player.name} tickles the air!`, 4, [player.uuid]);

  }
}
