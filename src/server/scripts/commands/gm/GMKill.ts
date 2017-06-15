
import { Command } from '../../../base/Command';
import { Player } from '../../../../models/player';
import { ItemCreator } from '../../../helpers/item-creator';

export class GMKill extends Command {

  public name = '@kill';
  public format = 'Target';

  async execute(player: Player, { client, room, gameState, args }) {
    if(!player.isGM) return;

    const possTargets = room.getPossibleMessageTargets(player, args);
    if(!possTargets.length) return room.sendClientLogMessage(client, 'You do not see that person.');

    const target = possTargets[0];
    if(target.hostility === 'Never') return room.sendClientLogMessage(client, 'That target is not killable.');

    target.hp.toMinimum();
    target.die(player);
  }
}
