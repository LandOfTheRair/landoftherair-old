
import { Command } from '../../../base/Command';
import { Player } from '../../../../shared/models/player';
import { MessageHelper } from '../../../helpers/world/message-helper';

export class Spit extends Command {

  public name = 'spit';
  public format = 'Target?';

  async execute(player: Player, { args }) {
    const possTargets = MessageHelper.getPossibleMessageTargets(player, args);

    if(possTargets && possTargets[0]) {
      const target = possTargets[0];

      player.sendClientMessage(`You spit at ${target.name}!`);
      target.sendClientMessage(`${player.name} spits at you!`);
      player.sendClientMessageToRadius(`${player.name} spits at ${target.name}!`, 4, [player.uuid, target.uuid]);
      target.addAgro(player, 1);
      return;
    }

    player.sendClientMessage('You spit!');
    player.sendClientMessageToRadius(`${player.name} spits!`, 4, [player.uuid]);

  }
}
